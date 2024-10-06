import path from "path"
import fs from "fs"
import { NextRequest, NextResponse } from "next/server"
import { fileTypeFromBuffer } from "file-type"
import sharp from "sharp"

export async function GET(req: NextRequest, res: NextResponse) {
  const DEFAULT_WIDTH = 1280
  const DEFAULT_HEIGHT = 620
  const DEFAULT_QUALITY = 75
  const resource = req.nextUrl.searchParams.get("resource")
  const width = req.nextUrl.searchParams.get("w")
    ? parseInt(req.nextUrl.searchParams.get("w") || DEFAULT_WIDTH.toString())
    : undefined
  const height = req.nextUrl.searchParams.get("h")
    ? parseInt(req.nextUrl.searchParams.get("h") || DEFAULT_HEIGHT.toString())
    : undefined
  let quality = req.nextUrl.searchParams.get("q")
    ? parseInt(req.nextUrl.searchParams.get("q") || DEFAULT_QUALITY.toString())
    : DEFAULT_QUALITY
  quality = quality > 100 ? 100 : quality

  console.log(__dirname, resource, width, height, quality)

  if (!resource) {
    return new NextResponse(null, {
      status: 400,
    })
  }

  const filePath = path.join(process.cwd(), process.env.RESOURCE_PATH || "resources", resource as string)

  console.log("filePath >>> ", filePath)

  try {
    if (fs.existsSync(filePath)) {
      const fileBuffer = fs.readFileSync(filePath) // Synchronously read the file into a buffer
      const contentType = (await fileTypeFromBuffer(fileBuffer).then((e) => e?.mime)) || "application/gzip" // Extract the content type

      console.log("contentType >>> ", contentType)

      // + if the content type is an image, resize it to the specified dimensions & quality
      if (contentType.startsWith("image")) {
        let image = sharp(fileBuffer)

        if (width) {
          image = image.resize(width || undefined, height || undefined, { fit: "inside" })
        }

        const resizedBuffer = await image.webp({ quality }).toBuffer()

        return new NextResponse(resizedBuffer, {
          headers: {
            "Content-Type": "image/webp",
          },
        })
      }

      // * return the file buffer as is
      return new NextResponse(fileBuffer, {
        headers: {
          "Content-Type": contentType,
        },
      })
    }

    return new NextResponse(null, {
      status: 404,
    })
  } catch (error) {
    console.error("Error retrieving resource: ", error)
    return new NextResponse(null, {
      status: 500,
    })
  }
}
