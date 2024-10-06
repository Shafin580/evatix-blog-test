import { NextRequest } from "next/server"
import { db } from "@/lib/db/drizzle"
import { blogs } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { responseHandler } from "@/lib/utils/response-handler"

export async function GET(
	req: NextRequest,
	{ params }: { params: { param: string } }
) {
	try {
		const { param } = params

		// Check if param is a number (ID) or a string (slug)
		const isId = !isNaN(Number(param))

		// Fetch the blog based on ID or slug
		const blog = await db
			.select()
			.from(blogs)
			.where(isId ? eq(blogs.id, Number(param)) : eq(blogs.slug, param))
			.limit(1)

		// If blog is not found, return a 404
		if (blog.length === 0) {
			return responseHandler({
				status: 404,
				error: "Not Found",
				message: "Blog not found",
			})
		}

		// Return the blog details
		return responseHandler({
			status: 200,
			results: blog[0],
		})
	} catch (error) {
		console.error("Error fetching blog: ", error)
		return responseHandler({
			status: 500,
			message: "Error fetching blog",
			error: (error as Error).message,
			stack: (error as Error).stack,
		})
	}
}
