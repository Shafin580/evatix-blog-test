import { NextRequest } from "next/server"
import { db } from "@/lib/db/drizzle"
import { blogs } from "@/lib/db/schema"
import { eq, ilike, and, desc, asc, sql, count, AnyColumn } from "drizzle-orm"
import {
	paginationHandler,
	responsePaginationHandler,
} from "@/lib/utils/pagination-handler"
import { responseHandler } from "@/lib/utils/response-handler"

export async function GET(req: NextRequest) {
	try {
		// Get query params for pagination, sorting, searching, etc.
		const {
			searchText,
			tags,
			state='published',
			sort = "createdAt",
			order = "desc",
		} = Object.fromEntries(new URL(req.url).searchParams)
		const { skip, limit, page } = paginationHandler(req)

		// Base query object
		let whereConditions = []

		// Apply search filter if provided
		if (searchText) {
			whereConditions.push(ilike(blogs.title, `%${searchText}%`))
		}

		// Apply tag-based filtering if provided
		if (tags) {
			const tagArray = tags.split(",")
			whereConditions.push(
				and(
					...tagArray.map(
						tag =>
							sql`EXISTS (SELECT 1 FROM unnest(${
								blogs.tags
							}) AS tag WHERE tag ILIKE ${"%" + tag + "%"})`
					)
				)
			)
		}

		// Apply state filter (e.g., 'published' or 'draft')
		if (state) {
			whereConditions.push(eq(blogs.state, state))
		}

		// Fetch the results
		const results = await db.query.blogs.findMany({
			where: whereConditions.length ? and(...whereConditions) : undefined,
			orderBy:
				order === "desc"
					? desc(blogs[sort as keyof typeof blogs] as AnyColumn)
					: asc(blogs[sort as keyof typeof blogs] as AnyColumn),
			limit,
			offset: skip,
		})

		// Fetch total count for pagination metadata
		const { totalCount } = (
			await db
				.select({ totalCount: count(blogs.id) })
				.from(blogs)
				.where(eq(blogs.state, state))
		)[0]
		const totalPages = Math.ceil(totalCount / limit)

		return responseHandler({
			status: 200,
			results: {
				data: results,
				...responsePaginationHandler({
					page,
					totalPages,
					totalCount,
				}),
			},
		})
	} catch (error) {
		console.error("Error retrieving blogs: ", error)
		return responseHandler({
			status: 500,
			message: "Error retrieving blogs",
			error: (error as Error).message,
			stack: (error as Error).stack,
		})
	}
}
