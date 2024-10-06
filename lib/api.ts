import { PATHS } from "@/router.config";
import { getAPIResponse } from "./utils/get-api-response";

const basePath = String(process.env.NEXT_PUBLIC_BASE_URL);

// + Function To Fetch Image Data
export const fetchImageData = async (imageSrc: string, imageName: string): Promise<File> => {
  try {
    const response = await fetch(imageSrc)
    const blob = await response.blob()
    const file = new File([blob], imageName, { type: blob.type })
    // return URL.createObjectURL(blob)
    return file
  } catch (error) {
    const file = new File([], "")
    console.error("Error fetching image data:", error)
    return file
  }
}

// Function to create or update a blog
export const createUpdateBlog = async (data: any) => {
  const response = await getAPIResponse({
    basePath: basePath,
    apiPath: PATHS.BLOG.CREATE_UPDATE().root,
    method: "POST",
    body: data,
  });

  return response;
};

// Function to Delete a blog
export const deleteBlog = async (id: number) => {
  const response = await getAPIResponse({
    basePath: basePath,
    apiPath: PATHS.BLOG.DELETE(id).root,
    method: "DELETE",
  });

  return response;
};
