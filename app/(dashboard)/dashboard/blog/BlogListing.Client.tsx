"use client";

import Button from "@/components/Button";
import ButtonIcon from "@/components/ButtonIcon";
import Icon from "@/components/Icon";
import ModalBlank from "@/components/ModalBlank";
import { TablePagyLite } from "@/components/table/TablePagyLite.Client";
import { useUser } from "@/lib/auth";
import { LINKS } from "@/router.config";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import BlogCreateUpdateModal from "./BlogCreateUpdateModal";

const BlogListing = () => {
  const { user } = useUser();
  const [selectedBlog, setSelectedBlog] = useState<BlogItemProps | null>(null);
  const [isUpdate, setIsUpdate] = useState(false);
  const [showCreateUpdateBlogModal, setShowCreateUpdateBlogModal] =
    useState(false);
  const token = "";
  return (
    <div>
      <div className="flex justify-between">
        <Link href={LINKS.DASHBOARD}>
          <div className="items-center text-black">
            <Icon iconName="arrow-left" iconColor="stroke-gray-500" />
            Back
          </div>
        </Link>
        <Button
          btnText="+ Add new post"
          className="bg-blue-400 text-white"
          clicked={() => {
            console.log("Add new post");
          }}
        />
      </div>
      <TablePagyLite<BlogItemProps>
        url={{
          basePath: "http://localhost:3000",
          apiPath: "/dummyBlogData.json",
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
                <Image alt={slug!} src={featureImage!} />
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
                <div className="flex justify-center space-x-12">
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
                    iconName="copy-05"
                    iconClassName="transition-colors hover:stroke-gray-500"
                    clicked={() => {
                      console.log("Copy Link", data);
                    }}
                  />
                  <ButtonIcon
                    iconName="trash-04"
                    iconClassName="transition-colors hover:stroke-gray-500"
                    clicked={() => {
                      console.log("Trash", data);
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
        startName="pageNo"
        sizeName="pageSize"
        totalRowName="totalRows"
        sortBy={{
          label: "sortBy",
          value: "id",
        }}
        sortOrder={{
          label: "sortOrder",
          value: "desc",
        }}
        rowsPerPage={10}
        rowsPerPageOptions={[10, 20, 30, 40, 50]}
        // queryParameters={{
        //   queryKey: ["page"],
        // }}
      />
      {showCreateUpdateBlogModal == false && (
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
