import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface TextInputFieldInterface {
  value: string;
  required: boolean;
  minLength?: number;
  maxLength?: number;
  isEmail: boolean;
}

export const validateTextInputField = ({
  value = "",
  required = true,
  minLength = 2,
  maxLength = 100,
  isEmail,
}: TextInputFieldInterface) => {
  if (required && value?.trim().length === 0 && !isEmail) {
    return { status: false, message: "This field is required" };
  }
  if (value?.trim().length < minLength && !isEmail) {
    return {
      status: false,
      message: `This field should be at least ${minLength} characters`,
    };
  }
  if (value?.trim().length > maxLength && !isEmail) {
    return {
      status: false,
      message: `This field should be at most ${maxLength} characters`,
    };
  }
  if (isEmail && (!value?.includes("@") || !value?.includes("."))) {
    return { status: false, message: "Please enter a valid email address" };
  }
  if (isEmail) {
    //check email address using regular expression
    const emailRegex =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!emailRegex.test(value)) {
      return { status: false, message: "Please enter a valid email address" };
    }
  }
  return { status: true, message: "" };
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onloadend = () => {
      if (reader.result) {
        resolve(reader.result.toString()); // Resolve with base64 string
      } else {
        reject(new Error("FileReader failed to read the file."));
      }
    };

    reader.onerror = (error) => {
      reject(error); // Reject if there's an error
    };
  });
};

import { NextResponse } from "next/server"
import { serialize } from "./serialize"

export const responseHandler = async ({
  status = 200,
  results = undefined,
  message = undefined,
  error = undefined,
  stack = undefined,
  headers = undefined,
  revalidate = undefined,
}: {
  status?: number
  results?: Record<string, any> | Record<string, any>[]
  message?: string
  error?: string
  stack?: string
  headers?: Headers
  revalidate?: number
}) => {
  const cacheControl = `public, max-age=${revalidate ?? 0}, stale-while-revalidate=${revalidate ?? 0}`

  return NextResponse.json(
    {
      status,
      ...(results ? { results: serialize(results) } : {}),
      ...(message ? { message } : {}),
      ...(error ? { error } : {}),
      ...(stack ? { stack } : {}),
      ...(headers ? { headers } : {}),
    },
    {
      status,
      headers: {
        "Cache-Control": cacheControl,
      },
    }
  )
}

export function responsePaginationHandler({
  page,
  totalPages,
  totalCount,
}: {
  page: number
  totalPages: number
  totalCount: number
}) {
  const pagination = {
    currentPage: page,
    totalPages,
    totalCount,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  }

  return { pagination }
}

import { NextRequest } from "next/server"

const DEFAULT_LIMIT = "10"

export function paginationHandler(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
  const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || DEFAULT_LIMIT, 10)))
  const skip = (page - 1) * limit

  console.log("paginationHandler >>> ", skip, limit, page)

  return { skip, limit, page }
}

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


import fs from "fs-extra"
import path from "path"
import { v4 as uuidv4 } from "uuid"

export async function fileSaver(files: File | File[], folderPath: string): Promise<string[]> {
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
