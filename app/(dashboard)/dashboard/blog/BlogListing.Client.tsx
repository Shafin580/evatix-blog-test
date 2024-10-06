"use client";

import ButtonIcon from "@/components/ButtonIcon";
import Icon from "@/components/Icon";
import ModalBlank from "@/components/ModalBlank";
import { TablePagyLite } from "@/components/table/TablePagyLite.Client";
import { useUser } from "@/lib/auth";
import { LINKS, PATHS, QUERY_KEYS } from "@/router.config";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import BlogCreateUpdateModal from "./BlogCreateUpdateModal";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import SelectSingle from "@/components/SelectSingle";
import TextField from "@/components/TextField";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteBlog } from "@/lib/api";

const BlogListing = () => {
  const { user } = useUser();
  const [selectedBlog, setSelectedBlog] = useState<BlogItemProps | null>(null);
  const [isUpdate, setIsUpdate] = useState(false);
  const [showCreateUpdateBlogModal, setShowCreateUpdateBlogModal] =
    useState(false);
  const token = "";

  const [searchText, setSearchText] = useState("");
  const [searchByTags, setSearchByTags] = useState("");
  const [selectedSort, setSelectedSort] = useState("id");
  const [selectedOrder, setSelectedOrder] = useState("asc");

  const queryClient = useQueryClient();

  // Function to delete a blog
  const { mutateAsync: deleteBlogQuery, status: deleteBlogQueryStatus } =
    useMutation({
      mutationFn: async (id: number) => {
        const response = await deleteBlog(id);
        if (response["status"] == 200) {
          queryClient.invalidateQueries();
        }
      },
    });

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
            setShowCreateUpdateBlogModal(true);
          }}
        >
          + Add new post
        </Button>
      </div>
      <div className="flex justify-between space-x-6">
        <TextField
          value={searchText}
          placeholder="search.."
          label="Search by text"
          onChange={(e) => {
            setSearchText(e.data as string);
          }}
        />

        <TextField
          value={searchByTags}
          placeholder="Tag search.."
          label="Search by tags"
          onChange={(e) => {
            setSearchByTags(e.data as string);
          }}
        />
        <SelectSingle
          labelProps={{ text: "Select Sort", isRequired: false }}
          className="w-full"
          selectSingleProps={{
            placeholder: "Select a sort",
            options: [
              { value: "id", label: "Sort by ID" },
              { value: "title", label: "Sort by Title" },
            ],
            onChange: (e) => {
              if (e != null) {
                setSelectedSort(e.value);
              }
            },
          }}
        />

        <SelectSingle
          labelProps={{ text: "Select Order", isRequired: false }}
          className="w-full"
          selectSingleProps={{
            placeholder: "Select a sort",
            options: [
              { value: "asc", label: "Ascending" },
              { value: "desc", label: "Descending" },
            ],
            onChange: (e) => {
              if (e != null) {
                setSelectedOrder(e.value);
              }
            },
          }}
        />
      </div>
      <TablePagyLite<BlogItemProps>
        url={{
          basePath: String(process.env.NEXT_PUBLIC_BASE_URL),
          apiPath: PATHS.BLOG.LIST({
            order: selectedOrder,
            searchText: searchText,
            sort: selectedSort,
            state: "published",
            tags: searchByTags,
          }).root,
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
                <Image alt={slug!} src={String(featureImage)} width={50} height={50} />
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
            Cell: (data) => (
              <>
                <div className="flex justify-center space-x-4">
                  <ButtonIcon
                    iconName="eye"
                    iconClassName="transition-colors hover:stroke-gray-500"
                    clicked={() => {
                      console.log("View", data);
                    }}
                  />
                  <ButtonIcon
                    iconName="edit-05"
                    iconClassName="transition-colors hover:stroke-gray-500"
                    clicked={() => {
                      console.log("Edit", data);
                      setIsUpdate(true);
                      setSelectedBlog(data);
                      setShowCreateUpdateBlogModal(true);
                    }}
                    isDisabled={user?.role == "user" ? true : false}
                  />
                  <ButtonIcon
                    iconName="trash-04"
                    iconClassName="transition-colors hover:stroke-gray-500"
                    clicked={() => {
                      console.log("Trash", data);
                      deleteBlogQuery(Number(data.id));
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
        rowsPerPage={10}
        rowsPerPageOptions={[10, 20, 30, 40, 50]}
        queryParameters={{
          queryKey: [
            QUERY_KEYS.BLOG.LIST({
              order: selectedOrder,
              searchText: searchText,
              sort: selectedSort,
              state: "published",
              tags: searchByTags,
            }).key,
          ],
        }}
      />
      {showCreateUpdateBlogModal == true && (
        <ModalBlank
          modalSize="md"
          crossBtnClassName="top-2 right-2 p-2"
          onCloseModal={(e: any) => {
            setShowCreateUpdateBlogModal(false);
            setIsUpdate(false);
          }}
          className="space-y-0 !bg-secondary p-8 sm:p-8"
          showCrossButton
          onClickOutToClose={false}
        >
          <BlogCreateUpdateModal isUpdate={isUpdate} blogData={selectedBlog} />
        </ModalBlank>
      )}
    </div>
  );
};

export default BlogListing;
