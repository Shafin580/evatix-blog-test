"use client"

import ButtonIcon from "@/components/ButtonIcon"
import Icon from "@/components/Icon"
import ModalBlank from "@/components/ModalBlank"
import { TablePagyLite } from "@/components/table/TablePagyLite.Client"
import { useUser } from "@/lib/auth"
import { LINKS } from "@/router.config"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import BlogCreateUpdateModal from "./BlogCreateUpdateModal"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useSearchParams } from "next/navigation"

const BlogListing = () => {
	const searchParams = useSearchParams()
	const q = searchParams.get("q")
	const { user } = useUser()
	const [selectedBlog, setSelectedBlog] = useState<BlogItemProps | null>(null)
	const [isUpdate, setIsUpdate] = useState(false)
	const [showCreateUpdateBlogModal, setShowCreateUpdateBlogModal] =
		useState(false)
	const token = ""

	return (
		<div className="space-y-4">
			<div className="flex justify-between">
				<Link
					href={LINKS.DASHBOARD}
					className="items-center flex gap-1 text-black"
				>
					<ArrowLeft className="h-4 w-4 shrink-0 transition-transform duration-200" />
					Back
				</Link>

				<Button
					className="bg-blue-400 text-white"
					onClick={() => {
						setShowCreateUpdateBlogModal(true)
					}}
				>
					+ Add new post
				</Button>
			</div>
			<TablePagyLite<BlogItemProps>
				url={{
					basePath: "http://localhost:3000",
					apiPath: `/api/blog/list?searchText=${q}`,
					token: token,
				}}
				columnHeaders={[
					{
						header: "ID",
						accessorKey: "id",
					},
					{
						header: "Title",
						accessorKey: "title",
					},
					{
						header: "Slug",
						accessorKey: "slug",
					},
					{
						header: "Feature Image",
						accessorKey: "featureImage",
						className: "text-center",
						Cell: ({ featureImage, slug }) => (
							<div className="flex justify-center">
								<Image
									alt={slug!}
									src={
										"http://localhost:3000/api/uploads?resource=" +
										featureImage!
									}
									width={50}
									height={50}
								/>
							</div>
						),
					},
					{
						header: "State",
						accessorKey: "state",
					},
					{
						header: "Actions",
						// containerClassName: "justify-around",
						className: "text-center",
						Cell: data => (
							<>
								<div className="flex justify-center space-x-4">
									<ButtonIcon
										iconName="eye"
										iconClassName="transition-colors hover:stroke-gray-500"
										clicked={() => {
											console.log("View", data)
										}}
									/>
									<ButtonIcon
										iconName="edit-05"
										iconClassName="transition-colors hover:stroke-gray-500"
										clicked={() => {
											console.log("Edit", data)
											setIsUpdate(true)
											setSelectedBlog(data)
											setShowCreateUpdateBlogModal(true)
										}}
										isDisabled={user?.role == "user" ? true : false}
									/>
									<ButtonIcon
										iconName="trash-04"
										iconClassName="transition-colors hover:stroke-gray-500"
										clicked={() => {
											console.log("Trash", data)
										}}
										isDisabled={
											user?.role == "user" || user?.role == "author"
												? true
												: false
										}
									/>
								</div>
							</>
						),
					},
				]}
				dataAccessorKey="results.data"
				startName="page"
				sizeName="limit"
				totalRowName="totalRows"
				sortBy={{
					label: "sort",
					value: "id",
				}}
				sortOrder={{
					label: "order",
					value: "desc",
				}}
				rowsPerPage={10}
				rowsPerPageOptions={[10, 20, 30, 40, 50]}
				// queryParameters={{
				//   queryKey: ["page"],
				// }}
			/>
			{showCreateUpdateBlogModal == true && (
				<ModalBlank
					modalSize="md"
					crossBtnClassName="top-2 right-2 p-2"
					onCloseModal={(e: any) => {
						setShowCreateUpdateBlogModal(false)
						setIsUpdate(false)
					}}
					className="space-y-0 !bg-secondary p-8 sm:p-8"
					showCrossButton
					onClickOutToClose={false}
				>
					<BlogCreateUpdateModal isUpdate={isUpdate} blogData={selectedBlog} />
				</ModalBlank>
			)}
		</div>
	)
}

export default BlogListing
