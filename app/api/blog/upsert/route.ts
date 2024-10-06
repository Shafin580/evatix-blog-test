import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/drizzle"
import { ActivityType, blogs } from "@/lib/db/schema"
import { desc, eq } from "drizzle-orm"
import path from "path"
import { CONSTANTS } from "@/lib/constants"
import fs from "fs-extra"
import { logActivity } from "@/app/(login)/actions"
import { responseHandler } from "@/lib/utils/response-handler"
import { fileSaver } from "@/lib/utils/file-saver"
import { slugGenerator } from "@/lib/utils/slug-generator"
import { getUserInfo } from "@/lib/utils/get-user-info"

export async function POST(req: NextRequest) {
	try {
		const userWithTeam = await getUserInfo()

		if (userWithTeam instanceof NextResponse) {
			return userWithTeam
		}

		if (userWithTeam.user.role === "user") {
			return responseHandler({
				status: 403,
				error: "Forbidden",
				message: "Forbidden access",
			})
		}

		// Parse the request body
		const body = await req.formData()
		const formData = Object.fromEntries(body) as {
			id?: FormDataEntryValue | number
			title?: FormDataEntryValue | string
			content?: FormDataEntryValue | string
			state?: FormDataEntryValue | string
			featureImage?: FormDataEntryValue | string | File
			tags?: FormDataEntryValue | string[]
			userId?: FormDataEntryValue | number
			publishedAt?: FormDataEntryValue | string | null
		}

		let {
				id,
				title,
				content,
				state = "published",
				tags,
				userId,
				publishedAt,
			} = formData,
			slug,
			featureImage = body.get("featureImage") as File | string

		// trim the string fields
		id = id ? Number(id.toString().trim()) : undefined
		title = title ? title.toString().trim() : ""
		content = content ? content.toString().trim() : ""
		state = state ? state.toString().trim() : "published"
		tags = tags
			? tags
					.toString()
					.split(",")
					.map((tag: string) => tag.trim())
			: undefined
		userId = userId ? Number((userId as string).trim()) : 1 // ! change this to undefined

		console.log(
			__dirname,
			id,
			title,
			content,
			state,
			featureImage,
			tags,
			userId,
			publishedAt
		)

		// + If an ID is provided, update the existing blog
		if (id) {
			const existingBlog = await db.query.blogs.findFirst({
				where: eq(blogs.id, id),
			})

			if (!existingBlog) {
				return responseHandler({
					status: 404,
					error: "Not Found",
					message: "Blog not found",
				})
			}

			const tempSlug = slugGenerator(title)
			const existingSlug = existingBlog.slug === tempSlug

			if (existingBlog.title !== title) {
				slug = existingSlug ? slugGenerator(title, true) : tempSlug
			}

			if (featureImage) {
				// Delete old image
				const fullPath = path.join(
					process.cwd(),
					CONSTANTS.resource_path,
					existingBlog.featureImage
				)
				if (fs.existsSync(fullPath)) {
					fs.unlinkSync(fullPath)
				}

				// Save new image if provided
				const savedFilePaths = await fileSaver(
					featureImage as File,
					"./" +
						path.join(
							CONSTANTS.resource_path,
							userId!.toString(),
							existingBlog.id.toString()
						)
				)
				featureImage = savedFilePaths[0]
			}

			const updatedBlog = await db
				.update(blogs)
				.set({
					title: title || existingBlog.title,
					slug: slug || existingBlog.slug,
					content: content || existingBlog.content,
					state: state || existingBlog.state,
					featureImage: featureImage || existingBlog.featureImage,
					tags: tags || existingBlog.tags,
					updatedAt: new Date(), // Update timestamp
					publishedAt: state === "published" ? new Date() : null,
				})
				.where(eq(blogs.id, id))
				.returning()

			// If no blog is found, return an error
			if (updatedBlog.length === 0) {
				return responseHandler({
					status: 404,
					error: "Not Found",
					message: "Blog not found",
				})
			}

			// Log the activity
			await logActivity(
				userWithTeam.teamId,
				userWithTeam.user.id,
				ActivityType.UPDATE_BLOG,
				(req.headers.get("X-Forwarded-For") || req.headers.get("x-real-ip")) ??
					undefined
			)

			// Return the updated blog
			return responseHandler({
				status: 200,
				message: "Blog updated successfully",
				results: updatedBlog[0],
			})
		}

		// + New blog creation logic

		if (!title || !content || !featureImage || !tags) {
			return responseHandler({
				status: 400,
				error: "Bad Request",
				message: "Missing required fields",
			})
		}

		// Check if the slug already exists
		const tempSlug = slugGenerator(title)
		const existingSlug = (
			await db
				.select({
					slug: blogs.slug,
				})
				.from(blogs)
				.where(eq(blogs.slug, tempSlug))
				.limit(1)
		)?.[0]?.slug

		const latestBlogId = (
			await db
				.select({ id: blogs.id })
				.from(blogs)
				.orderBy(desc(blogs.id))
				.limit(1)
		)?.[0].id

		// If no ID is provided, create a new blog
		const newBlog = (
			await db
				.insert(blogs)
				.values({
					id: latestBlogId ? latestBlogId + 1 : 1,
					title,
					slug: existingSlug ? slugGenerator(title, true) : tempSlug,
					content,
					state: "draft",
					featureImage: featureImage as string,
					tags,
					userId,
					createdAt: new Date(),
					updatedAt: new Date(),
					publishedAt: null,
				})
				.returning()
		)[0]

		//  Save images
		const savedFilePaths = await fileSaver(
			featureImage as File,
			"./" +
				path.join(
					CONSTANTS.resource_path,
					userId.toString(),
					newBlog.id.toString()
				)
		)

		const updatedBlog = (
			await db
				.update(blogs)
				.set({
					featureImage: savedFilePaths[0],
				})
				.where(eq(blogs.id, newBlog.id))
				.returning()
		)[0]

		// Log the activity
		await logActivity(
			userWithTeam.teamId,
			userWithTeam.user.id,
			ActivityType.CREATE_BLOG,
			(req.headers.get("X-Forwarded-For") || req.headers.get("x-real-ip")) ??
				undefined
		)

		// Return the newly created blog
		return responseHandler({
			status: 201,
			message: "Blog created successfully",
			results: updatedBlog,
		})
	} catch (error) {
		console.error("Error in upserting blog: ", error)
		return responseHandler({
			status: 500,
			message: "Error in upserting blog",
			error: (error as Error).message,
			stack: (error as Error).stack,
		})
	}
}
