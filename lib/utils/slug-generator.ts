import slugify from "slugify"

export const slugGenerator = (topicName: string, generateWithRand = false) => {
	topicName = topicName.trim()
	const remove = /[*+~.()'"!:|@$,?^/#&=%{}[\]<>\\;_`]/g

	// Detect if the input contains non-Latin characters (e.g., Bangla)
	const isLatin = /^[\u0000-\u007F]+$/.test(topicName)

	let slug: string

	if (isLatin) {
		// If the text is Latin-based (e.g., English), use slugify
		slug = slugify(topicName, {
			lower: true,
			strict: true,
			remove,
		})
	} else {
		// Handle non-Latin text (e.g., Bangla) by preserving characters and replacing spaces with hyphens
		slug = topicName
			.replace(remove, "") // Remove special characters
			.replace(/\s+/g, "-") // Replace spaces with hyphens
			.toLowerCase() // Convert to lowercase

		slug.endsWith("-") && (slug = slug.slice(0, -1))
	}

	if (generateWithRand) {
		slug += `-${Math.random().toString(36).substring(2, 9)}`
	}

	return slug
}
