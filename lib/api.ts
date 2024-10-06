import { PATHS } from "@/router.config";
import { getAPIResponse } from "./utils/get-api-response";

const basePath = String(process.env.NEXT_PUBLIC_BASE_URL);

// Function to create or update a blog
export const createUpdateBlog = async ({
  id,
  content,
  featureImage,
  tags,
  title,
  userId,
  state = "published",
}: {
  id?: number;
  title: string;
  content: string;
  state?: string;
  featureImage: File;
  tags: string[];
  userId: number;
}) => {
  const data = id
    ? {
        id: id,
        title: title,
        content: content,
        state: state,
        featureImage: featureImage,
        tags: tags,
        userId: userId,
      }
    : {
        title: title,
        content: content,
        state: state,
        featureImage: featureImage,
        tags: tags,
        userId: userId,
      };
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
