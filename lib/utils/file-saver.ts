import fs from "fs-extra"
import path from "path"
import { v4 as uuidv4 } from "uuid"

export async function fileSaver(
	files: File | File[],
	folderPath: string
): Promise<string[]> {
	if (!Array.isArray(files)) {
		files = [files]
	}

	const savedFilePaths: string[] = []

	// ensure the directory exists
	try {
		await fs.access(folderPath)
	} catch (e) {
		// else create the directory
		await fs.mkdir(folderPath, {
			recursive: true,
			// mode: 0o777,
		})
	}

	for (const file of files) {
		const bytes = await file.arrayBuffer()
		const buffer = Buffer.from(bytes)

		const extension = path.extname(file.name)
		// uuid + timestamp in milliseconds+ extension
		const fileName = `${uuidv4()}-${new Date().getTime()}${extension}`
		const filePath = path.join(folderPath, fileName)

		// Read the file data and save it to the filesystem
		await fs.writeFile(filePath, buffer)

		// delete the first (public) folder from path and push it
		savedFilePaths.push("/" + filePath.split("/").slice(1).join("/"))
	}

	return savedFilePaths
}
