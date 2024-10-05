import { NextRequest } from "next/server"
import { db } from "@/lib/db/drizzle"
import { blogs } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { responseHandler } from "@/lib/utils"

export async function DELETE(req: NextRequest) {
	try {
		// Extract blog ID from the URL query parameters
		const { searchParams } = new URL(req.url)
		const blogId = searchParams.get("id")

		// Ensure blogId is provided
		if (!blogId) {
			return responseHandler({
				status: 400,
				error: "Bad Request",
				message: "Blog ID is required",
			})
		}

		// Delete the blog entry from the database
		const result = await db
			.delete(blogs)
			.where(eq(blogs.id, Number(blogId)))
			.returning()

		console.log("result >>> ", result)

		// Check if the blog was deleted
		if (result.length === 0) {
			return responseHandler({
				status: 404,
				message: "Blog not found or already deleted",
			})
		}

		// Return a success response if the deletion was successful
		return responseHandler({
			status: 200,
			message: "Blog successfully deleted",
			results: result[0],
		})
	} catch (error) {
		console.error("Error deleting blog: ", error)
		return responseHandler({
			status: 500,
			message: "Error deleting blog",
			error: (error as Error).message,
			stack: (error as Error).stack,
		})
	}
}
