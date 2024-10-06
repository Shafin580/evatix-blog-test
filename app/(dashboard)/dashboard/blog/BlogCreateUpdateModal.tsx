"use client"

import Button from "@/components/Button"
import MultipleFileUploadCustom from "@/components/MultipleFileUploadCustom"
import RichTextEditor from "@/components/RichTextEditor/RichTextEditor"
import SelectCreatableMulti from "@/components/SelectCreatableMulti"
import TextField from "@/components/TextField"
import { useUser } from "@/lib/auth"
import {
	convertObjectToFormData,
	fileToBase64,
	validateTextInputField,
} from "@/lib/utils"
import { getAPIResponse } from "@/lib/utils/get-api-response"
import { useMutation } from "@tanstack/react-query"
import { useEffect, useState } from "react"

const BlogCreateUpdateModal = ({
	isUpdate,
	blogData,
}: {
	isUpdate: boolean
	blogData: BlogItemProps | null
}) => {
	const { user } = useUser()
	const [formData, setFormData] = useState<BlogItemProps>()
	const [descriptionRandomKey, setDescriptionRandomKey] = useState(14)
	const [errors, setErrors] = useState<{
		titleError: undefined | string
		featureImageError: undefined | string
		contentError: undefined | string
		tagsError: undefined | string
	}>({
		titleError: undefined,
		featureImageError: undefined,
		contentError: undefined,
		tagsError: undefined,
	})

	// Function to check if data is valid
	const checkDataValidation = (data: BlogItemProps) => {
		let status = true

		if (data?.featureImage?.length == 0) {
			setErrors(prev => ({
				...prev,
				featureImageError: "Please Upload an Image",
			}))
			status = false
		}

		const titleValidation = validateTextInputField({
			isEmail: false,
			required: true,
			value: data.title as string,
			minLength: 3,
			maxLength: 1000,
		})
		if (titleValidation.status == false) {
			setErrors(prev => ({ ...prev, titleError: titleValidation.message }))
			status = false
		}

		const contentValidation = validateTextInputField({
			isEmail: false,
			required: true,
			value: data.content as string,
			minLength: 20,
			maxLength: 1000,
		})
		if (contentValidation.status == false) {
			setErrors(prev => ({
				...prev,
				contentError: contentValidation.message,
			}))
			status = false
		}

		if (data.tags?.length == 0) {
			setErrors(prev => ({
				...prev,
				tagsError: "Please insert at least one tag",
			}))
			status = false
		}

		return status
	}

	// Function to create a blog
	const { mutateAsync: createBlogQuery, isPending: createBlogQueryPending } =
		useMutation({
			mutationFn: async (data: BlogItemProps) => {
				// const response = await createBlog(data)
				const randomNumber = Math.floor(Math.random() * 9999) + 1
				setDescriptionRandomKey(randomNumber)
			},
		})

	// Function to update a blog
	const { mutateAsync: updateBlogQuery, isPending: updateBlogQueryPending } =
		useMutation({
			mutationFn: async (data: BlogItemProps) => {
				// const response = await updateBlog(data)
				const randomNumber = Math.floor(Math.random() * 9999) + 1
				setDescriptionRandomKey(randomNumber)
			},
		})

	// On Component Mount useEffect Call to update formData based on isUpdate State
	useEffect(() => {
		if (user) {
			if (isUpdate && blogData) {
				setFormData(prev => ({
					...prev,
					content: blogData.content,
					featureImage: blogData.featureImage,
					id: blogData.id,
					slug: blogData.slug,
					state: blogData.state,
					tags: blogData.tags,
					title: blogData.title,
					userId: user.id,
				}))
				const randomNumber = Math.floor(Math.random() * 9999) + 1
				setDescriptionRandomKey(randomNumber)
			} else {
				setFormData(prev => ({
					...prev,
					content: "",
					featureImage: "",
					id: "",
					slug: "",
					state: "published",
					tags: [],
					title: "",
					userId: user.id,
				}))
			}
		}
	}, [isUpdate, blogData, user])

	// Debugging UseEffect Calls
	useEffect(() => {
		console.log("Form Data", formData)
	}, [formData])

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
						onChange={e => {
							setFormData(prev => ({
								...prev,
								title: e.data as string,
							}))
							setErrors(prev => ({ ...prev, titleError: undefined }))
						}}
					/>
					{/* {content} */}
					<RichTextEditor
						key={descriptionRandomKey}
						isRequired
						label={"Blog Content"}
						content={isUpdate ? (formData?.content as string) : ""}
						onChange={value => {
							setFormData(prev => ({
								...prev,
								content: value == "<p></p>" ? "" : value,
							}))
							setErrors(prev => ({ ...prev, contentError: undefined }))
						}}
						errorText={errors.contentError}
					/>
					{/* {Feature Image} */}
					<MultipleFileUploadCustom
						allowedFileTypes="image/png, image/jpeg, image/jpg"
						btnText={"Upload an Image"}
						getFiles={async (files: any) => {
							if (files) {
								setFormData(prev => ({ ...prev, featureImage: files[0] }))
							}
						}}
						maxUploadSize={10}
						maxUploadFileNumber={1}
						clearFiles={updateBlogQueryPending ? true : false}
						showCloseButton={true}
						className="rounded-md border border-foreground dark:border-border"
						previewSize="xs"
						isMultiSelected={false}
					/>
					{/* {Tags} */}
					<SelectCreatableMulti
						placeholder={"Enter Tags"}
						value={formData?.tags!.map(data => ({
							label: data,
							value: data,
						}))}
						size="sm"
						onChange={(values: any) => {
							console.log(
								"tags value:",
								values.map((item: any) => item.value).join(",")
							)
							setFormData(prev => ({
								...prev,
								tags: values.map((item: any) => item.value),
							}))
						}}
						isRequired={false}
						labelProps={{ text: "Tags", className: "font-bold" }}
					/>
					<div className="flex w-full flex-col items-center space-y-2">
						<Button
							btnText="Submit"
							className="w-full bg-green-500 text-white"
							isDisabled={createBlogQueryPending ? true : false}
							clicked={async () => {
								console.log("Form Data:", formData)
								// const validation = checkDataValidation(formData!);
								// if (validation == true) {
								// const response = await getAPIResponse({
								// 	basePath: "",
								// 	apiPath: "/api/blog/upsert",
								// 	body: convertObjectToFormData(formData),
								// 	method: "POST",
								// 	addMultipartHeader: true,
								// })
								const formDataToSend = convertObjectToFormData({...formData, tags: formData?.tags?.join(",")})

								// Make the POST request using fetch
								const response = await fetch("/api/blog/upsert", {
									method: "POST",
									body: formDataToSend,
									headers: {
										// No need to manually set the 'Content-Type' for FormData, fetch will handle it
									},
								})

								console.log("Response >>> ", response)

								// }
							}}
						/>

						{/* {successMessage.length > 0 && (
              <p className="text-green-500">{successMessage}</p>
            )}
            {errorMessage.length > 0 && (
              <p className="text-rose-500">{errorMessage}</p>
            )} */}
					</div>
				</div>
			</div>
		</div>
	)
}

export default BlogCreateUpdateModal
