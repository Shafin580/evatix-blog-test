import { eq } from "drizzle-orm"
import { getSession } from "../auth/session"
import { db } from "../db/drizzle"
import { users, teams, teamMembers } from "../db/schema"
import { responseHandler } from "./response-handler"
import { getUserWithTeam } from "../db/queries"

export async function getUserInfo() {
	const session = await getSession()

	if (!session) {
		return responseHandler({
			status: 401,
			error: "Unauthorized",
			message: "Unauthorized access detected",
		})
	}

	const { teamId, user } = await getUserWithTeam(session.user.id)

	if (!user) {
		return responseHandler({
			status: 401,
			error: "Unauthorized",
			message: "Unauthorized access detected",
		})
	}

	return { teamId, user }
}
