"use client";

import Button from "@/components/Button";
import ErrorText from "@/components/ErrorText";
import MultipleFileUploadCustom from "@/components/MultipleFileUploadCustom";
import RichTextEditor from "@/components/RichTextEditor/RichTextEditor";
import SelectCreatableMulti from "@/components/SelectCreatableMulti";
import TextField from "@/components/TextField";
import { createUpdateBlog, fetchImageData } from "@/lib/api";
import { useUser } from "@/lib/auth";
import {
  convertObjectToFormData,
  fileToBase64,
  validateTextInputField,
} from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

const BlogCreateUpdateModal = ({
  isUpdate,
  blogData,
}: {
  isUpdate: boolean;
  blogData: BlogItemProps | null;
}) => {
  const queryClient = useQueryClient();
  const { user } = useUser();
  const [formData, setFormData] = useState<BlogItemProps>();
  const [descriptionRandomKey, setDescriptionRandomKey] = useState(14);
  const [errors, setErrors] = useState<{
    titleError: undefined | string;
    featureImageError: undefined | string;
    contentError: undefined | string;
    tagsError: undefined | string;
  }>({
    titleError: undefined,
    featureImageError: undefined,
    contentError: undefined,
    tagsError: undefined,
  });

  // Function to check if data is valid
  const checkDataValidation = (data: BlogItemProps) => {
    let status = true;

    const titleValidation = validateTextInputField({
      isEmail: false,
      required: true,
      value: data.title as string,
      minLength: 3,
      maxLength: 1000,
    });
    if (titleValidation.status == false) {
      setErrors((prev) => ({ ...prev, titleError: titleValidation.message }));
      status = false;
    }

    const contentValidation = validateTextInputField({
      isEmail: false,
      required: true,
      value: data.content as string,
      minLength: 3,
      maxLength: 10000,
    });
    if (contentValidation.status == false) {
      setErrors((prev) => ({
        ...prev,
        contentError: contentValidation.message,
      }));
      status = false;
    }

    if (data.tags?.length == 0) {
      setErrors((prev) => ({
        ...prev,
        tagsError: "Please insert at least one tag",
      }));
      status = false;
    }

    console.log("Validation: ", status);

    return status;
  };

  // Function to get image data using src
  const getImageData = async (image: string) => {
    const data = await fetchImageData(
      "http://localhost:3000/api/uploads?resource=" + image,
      `edited-image`
    );
    setFormData((prev) => ({ ...prev, images: data }));
  };

  // On Component Mount useEffect Call to update formData based on isUpdate State
  useEffect(() => {
    if (user) {
      if (isUpdate && blogData) {
        setFormData((prev) => ({
          ...prev,
          content: blogData.content,
          id: blogData.id,
          slug: blogData.slug,
          state: blogData.state,
          tags: blogData.tags,
          title: blogData.title,
          userId: user.id,
        }));
        const randomNumber = Math.floor(Math.random() * 9999) + 1;
        setDescriptionRandomKey(randomNumber);
        getImageData(String(blogData.featureImage));
      } else {
        setFormData((prev) => ({
          ...prev,
          content: "",
          featureImage: "",
          id: "",
          slug: "",
          state: "published",
          tags: [],
          title: "",
          userId: user.id,
        }));
      }
    }
  }, [isUpdate, blogData, user]);

  // Debugging UseEffect Calls
  useEffect(() => {
    console.log("Form Data", formData);
  }, [formData]);

  return (
    <div className="h-full w-full">
      <div className="flex w-full flex-col space-y-12">
        <div className="flex flex-col space-y-6">
          {/* {title} */}
          <TextField
            label="Title"
            value={formData?.title}
            placeholder="Insert Title..."
            isRequired={true}
            onChange={(e) => {
              setFormData((prev) => ({
                ...prev,
                title: e.data as string,
              }));
              setErrors((prev) => ({ ...prev, titleError: undefined }));
            }}
            errorText={errors.titleError}
          />
          {/* {content} */}
          <RichTextEditor
            key={descriptionRandomKey}
            isRequired
            label={"Blog Content"}
            content={isUpdate ? (formData?.content as string) : ""}
            onChange={(value) => {
              setFormData((prev) => ({
                ...prev,
                content: value == "<p></p>" ? "" : value,
              }));
              setErrors((prev) => ({ ...prev, contentError: undefined }));
            }}
            errorText={errors.contentError}
          />
          {/* {Feature Image} */}
          <div>
            <MultipleFileUploadCustom
              allowedFileTypes="image/png, image/jpeg, image/jpg"
              btnText={"Upload an Image"}
              // onLoadFiles={isUpdate ? [formData?.featureImage as File] : []}
              getFiles={async (files: any) => {
                if (files) {
                  setFormData((prev) => ({ ...prev, featureImage: files[0] }));
                }
              }}
              maxUploadSize={10}
              maxUploadFileNumber={1}
              showCloseButton={true}
              className="rounded-md border border-foreground dark:border-border"
              previewSize="xs"
              isMultiSelected={false}
            />
            <ErrorText text={errors.featureImageError} />
          </div>
          {/* {Tags} */}
          <SelectCreatableMulti
            placeholder={"Enter Tags"}
            value={formData?.tags!.map((data) => ({
              label: data,
              value: data,
            }))}
            size="sm"
            onChange={(values: any) => {
              console.log(
                "tags value:",
                values.map((item: any) => item.value).join(",")
              );
              setFormData((prev) => ({
                ...prev,
                tags: values.map((item: any) => item.value),
              }));
            }}
            isRequired={false}
            labelProps={{ text: "Tags", className: "font-bold" }}
            errorText={errors.tagsError}
          />
          <div className="flex w-full flex-col items-center space-y-2">
            <Button
              btnText={isUpdate ? "Update" : "Create"}
              className="w-full bg-green-500 text-white"
              clicked={async () => {
                console.log("Form Data:", formData);
                if (formData && checkDataValidation(formData)) {
                  const tempData = isUpdate
                    ? {
                        id: Number(formData.id),
                        title: formData.title!,
                        content: formData.content!,
                        featureImage: formData.featureImage as File,
                        tags: formData.tags!,
                        state: "published",
                        userId: Number(formData.userId),
                      }
                    : {
                        id: undefined,
                        title: formData.title!,
                        content: formData.content!,
                        featureImage: formData.featureImage as File,
                        tags: formData.tags!,
                        state: "published",
                        userId: Number(formData.userId),
                      };
                  const formDataToSend = convertObjectToFormData({
                    ...tempData,
                    tags: tempData?.tags?.join(","),
                  });

                  // Make the POST request using fetch
                  const response = await fetch("/api/blog/upsert", {
                    method: "POST",
                    body: formDataToSend,
                    headers: {
                      // No need to manually set the 'Content-Type' for FormData, fetch will handle it
                    },
                  });
                  if (response["status"] == 200 || response["status"] == 201) {
                    const randomNumber = Math.floor(Math.random() * 9999) + 1;
                    setDescriptionRandomKey(randomNumber);
                    queryClient.invalidateQueries();
                  }
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogCreateUpdateModal;
