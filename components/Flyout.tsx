"use client"
import React, { Fragment, useState } from "react"
import { Menu, Transition } from "@headlessui/react"
import Link from "next/link"
import Button from "./Button"
import { cn } from "@/lib/utils"

export interface FlyoutProps {
  forwardRef?: any
  className?: string
  itemWrapperClassName?: string
  isRowEnd?: boolean
  notificationItems?: Array<NotificationItemsProps>
  isOpen?: boolean
  items?: React.ReactNode[]
  controllingComponent?: React.ReactNode[]
  itemsAlign?: "left" | "right"
}
export interface NotificationItemsProps {
  title?: string
  isRead?: boolean
  url?: string
}

/**
 * @name Flyout
 * @description
 * This component is used to render a Flyout.
 * The flyout can be used to render list.
 * @param {string} className CSS class name to be applied to the flyout parent div
 * @param {boolean} isRowEnd CSS class name to be applied to the flyout parent if the flyout is at the most right side of the screen
 * @param {boolean} isOpen is to open or close the flyout
 * @param { React.ReactNode[]} items is to show the flyout items.
 * @param { React.ReactNode[]} NotificationItems is to show the notification items.
 * @param {"left" | "right"} itemsAlign is to align left or right the items/notification items .
 */

function Flyout({
  forwardRef,
  className,
  itemWrapperClassName,
  isRowEnd = false,
  isOpen = false,
  notificationItems = [],
  items = [],
  controllingComponent = [],
  itemsAlign = "left",
}: FlyoutProps) {
  const [toggleValue, setToggleValue] = useState<any>(false)

  return (
    <div
      className={`altd-flyout space-y-12 ${controllingComponent.length > 0 ? "relative" : ""}`}
      ref={forwardRef}
    >
      {controllingComponent.length > 0 ? (
        controllingComponent
      ) : (
        <Button
          className="relative"
          clicked={() => {
            if (!toggleValue) {
              setToggleValue(true)
            } else {
              setToggleValue(false)
            }
          }}
        />
      )}

      <Menu>
        <Transition
          as={Fragment}
          show={controllingComponent.length == 0 ? toggleValue : isOpen}
          enter="transition ease-out duration-200"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items
            className={cn(
              "absolute z-50 mt-10 w-max rounded-md bg-white py-12 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none",
              isRowEnd ? "right-48" : "",
              itemsAlign == "right" ? "right-0" : "",
              className
            )}
          >
            {items.length > 0 &&
              notificationItems.length == 0 &&
              items.map((item, index) => {
                return (
                  <Menu.Item key={index}>
                    <div
                      className={cn(
                        "z-50 flex w-full flex-col px-16 py-4 font-medium text-slate-700 sm:text-sm lg:text-sm",
                        items.length > 1 && "space-y-8",
                        itemWrapperClassName
                      )}
                    >
                      {item}
                    </div>
                  </Menu.Item>
                )
              })}

            {notificationItems.length > 0 &&
              items.length == 0 &&
              notificationItems.map((item, index) => (
                <Menu.Item key={index}>
                  <>
                    <Link
                      href={item.url ? item.url : ""}
                      className={`block max-w-sm  px-16 py-4 font-medium text-slate-700 sm:text-sm lg:text-sm ${
                        item.isRead == false ? "bg-slate-300" : ""
                      }`}
                    >
                      {item.title}
                      {notificationItems ? (
                        !(index + 2 > notificationItems.length) ? (
                          <hr className="mt-8" />
                        ) : (
                          ""
                        )
                      ) : (
                        ""
                      )}
                    </Link>
                  </>
                </Menu.Item>
              ))}
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  )
}

export default Flyout
