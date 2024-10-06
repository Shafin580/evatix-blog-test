import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/drizzle"
import { ActivityType, blogs, users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { logActivity } from "@/app/(login)/actions"
import { responseHandler } from "@/lib/utils/response-handler"
import { getUserInfo } from "@/lib/utils/get-user-info"

export async function DELETE(req: NextRequest) {
	try {
		const userWithTeam = await getUserInfo()

		if (userWithTeam instanceof NextResponse) {
			return userWithTeam
		}

		if (userWithTeam.user.role !== "admin") {
			return responseHandler({
				status: 403,
				error: "Forbidden",
				message: "Forbidden access",
			})
		}

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

		// Log the activity
		await logActivity(
			userWithTeam.teamId,
			userWithTeam.user.id,
			ActivityType.DELETE_BLOG,
			(req.headers.get("X-Forwarded-For") || req.headers.get("x-real-ip")) ??
				undefined
		)

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
