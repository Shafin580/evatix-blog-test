import { stripe } from "../payments/stripe"
import { db } from "./drizzle"
import { users, teams, teamMembers, blogs } from "./schema"
import { hashPassword } from "@/lib/auth/session"

async function createStripeProducts() {
	console.log("Creating Stripe products and prices...")

	const baseProduct = await stripe.products.create({
		name: "Base",
		description: "Base subscription plan",
	})

	await stripe.prices.create({
		product: baseProduct.id,
		unit_amount: 800, // $8 in cents
		currency: "usd",
		recurring: {
			interval: "month",
			trial_period_days: 7,
		},
	})

	const plusProduct = await stripe.products.create({
		name: "Plus",
		description: "Plus subscription plan",
	})

	await stripe.prices.create({
		product: plusProduct.id,
		unit_amount: 1200, // $12 in cents
		currency: "usd",
		recurring: {
			interval: "month",
			trial_period_days: 7,
		},
	})

	console.log("Stripe products and prices created successfully.")
}

async function createBlogItems() {
	await db
		.insert(blogs)
		.values([
			{
				id: 1,
				title: "Understanding JavaScript Closures",
				slug: "understanding-javascript-closures",
				content:
					"In this blog, we will explore the concept of closures in JavaScript and how they work. Closures are an essential part of JavaScript programming and are often used in various contexts...",
				featureImage: "https://example.com/images/js-closures.png",
				state: "published",
				tags: ["JavaScript", "Closures", "Programming"],
				userId: 1,
			},
			{
				id: 2,
				title: "Getting Started with Next.js",
				slug: "getting-started-with-next-js",
				content:
					"Next.js is a powerful React framework for building server-side rendered applications. In this blog post, we will cover the basics of Next.js and walk through the steps of creating your first app...",
				featureImage: "https://example.com/images/nextjs-intro.png",
				state: "draft",
				tags: ["JavaScript", "Closures", "Programming"],
				userId: 1,
			},
			{
				id: 3,
				title: "A Comprehensive Guide to Python Decorators",
				slug: "comprehensive-guide-to-python-decorators",
				content:
					"Decorators provide a way to modify the behavior of a function or class. In this post, we'll deep dive into how decorators work in Python, along with practical examples...",
				featureImage: "https://example.com/images/python-decorators.png",
				state: "published",
				tags: ["JavaScript", "Closures", "Programming"],
				userId: 1,
			},
			{
				id: 4,
				title: "Mastering Docker for Developers",
				slug: "mastering-docker-for-developers",
				content:
					"Docker is a tool designed to make it easier to create, deploy, and run applications by using containers. This guide will help you master Docker and its key concepts...",
				featureImage: "https://example.com/images/docker-guide.png",
				state: "archived",
				tags: ["JavaScript", "Closures", "Programming"],
				userId: 1,
			},
		])

	console.log("Initial blogs created.")
}

async function seed() {
	// const email = "test@test.com"
	// const password = "admin123"
	// const passwordHash = await hashPassword(password)

	// const [user] = await db
	// 	.insert(users)
	// 	.values([
	// 		{
	// 			email: email,
	// 			passwordHash: passwordHash,
	// 			role: "admin",
	// 		},
	// 		{
	// 			email: "author@test.com",
	// 			passwordHash: passwordHash,
	// 			role: "author",
	// 		},
	// 		{
	// 			email: "admin@test.com",
	// 			passwordHash: passwordHash,
	// 			role: "admin",
	// 		},
	// 		{
	// 			email: "user@test.com",
	// 			passwordHash: passwordHash,
	// 			role: "user",
	// 		},
	// 	])
	// 	.returning()

	// console.log("Initial user created.")

	// const [team] = await db
	// 	.insert(teams)
	// 	.values({
	// 		name: "Test Team",
	// 	})
	// 	.returning()

	// await db.insert(teamMembers).values({
	// 	teamId: team.id,
	// 	userId: user.id,
	// 	role: "owner",
	// })

	// await createStripeProducts()
	await createBlogItems()
}

seed()
	.catch(error => {
		console.error("Seed process failed:", error)
		process.exit(1)
	})
	.finally(() => {
		console.log("Seed process finished. Exiting...")
		process.exit(0)
	})
