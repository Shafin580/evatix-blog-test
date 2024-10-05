import { NextRequest } from "next/server"
import { db } from "@/lib/db/drizzle"
import { blogs } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { fileSaver, responseHandler, slugGenerator } from "@/lib/utils"
import path from "path"
import { CONSTANTS } from "@/lib/constants"
import fs from "fs-extra"

export async function POST(req: NextRequest) {
	try {
		// Parse the request body
		const body = await req.json()
		let {
				id,
				title,
				content,
				state = "draft",
				featureImage,
				tags,
				userId,
				publishedAt,
			} = body,
			slug

		// trim the string fields
		title = title.trim()
		content = content.trim()
		state = state.trim()
		featureImage = featureImage.trim()
		tags = tags.map((tag: string) => tag.trim())

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
			const existingSlug = existingBlog.slug

			if (existingBlog.title !== title) {
				slug = existingSlug ? slugGenerator(title, true) : tempSlug
			}

			if (featureImage) {
				// Delete old image
				const fullPath = path.join(
					process.cwd(),
					CONSTANTS.resource_path,
					featureImage
				)
				if (fs.existsSync(fullPath)) {
					fs.unlinkSync(fullPath)
				}

				// Save new image if provided
				const savedFilePaths = await fileSaver(
					featureImage,
					"./" +
						path.join(
							CONSTANTS.resource_path,
							userId.toString(),
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
					publishedAt: state === "published" ? new Date(publishedAt) : null,
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

			// Return the updated blog
			return responseHandler({
				status: 200,
				message: "Blog updated successfully",
				results: updatedBlog[0],
			})
		}

		// + New blog creation logic

		if (!title || !slug || !content || !featureImage || !tags || !userId) {
			return responseHandler({
				status: 400,
				error: "Bad Request",
				message: "Missing required fields",
			})
		}

		// Check if the slug already exists
		const existingSlug = (await db
			.select({
				slug: blogs.slug,
			})
			.from(blogs)
			.where(eq(blogs.slug, slug))
			.limit(1))?.[0]?.slug

		// If no ID is provided, create a new blog
		const newBlog = (
			await db
				.insert(blogs)
				.values({
					title,
					slug: existingSlug ? slugGenerator(title, true) : slug,
					content,
					state,
					featureImage,
					tags,
					userId,
					createdAt: new Date(),
					updatedAt: new Date(),
					publishedAt: state === "published" ? new Date(publishedAt) : null,
				})
				.returning()
		)[0]

		//  Save images
		const savedFilePaths = await fileSaver(
			featureImage,
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
