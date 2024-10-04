"use client"

import { Fragment, useEffect, useId, useRef, useState } from "react"
import variables from "@variables/variables.module.scss"
import { TSortProps, TablePagyLiteProps } from "../TablePagyLite.Client"
import Button from "@/components/Button"
import ButtonIcon from "@/components/ButtonIcon"
import Flyout from "@/components/Flyout"

interface FlyoutMenuProps {
  sortProps: TSortProps
  columnHeader: TablePagyLiteProps<any>["columnHeaders"][0]
  onSort: (direction: "asc" | "desc" | null) => void
  onFilter: () => void
}

const FlyoutMenu = ({ sortProps, columnHeader, onSort, onFilter }: FlyoutMenuProps) => {
  const ref = useRef(null)
  const [isFlyoutOpen, setIsFlyoutOpen] = useState(false)

  const handleClickOutside = (event: any) => {
    const val: any = ref.current

    if (val && !val.contains(event.target)) {
      // You can add your logic here for what should happen when the user clicks outside the component
      isFlyoutOpen && setIsFlyoutOpen(false)
    }
  }

  useEffect(() => {
    if (isFlyoutOpen) {
      window.addEventListener("click", handleClickOutside, { capture: true })
    }
    return () => {
      window.removeEventListener("click", handleClickOutside)
    }
  }, [isFlyoutOpen])

  return (
    <>
      <Flyout
        isRowEnd
        forwardRef={ref}
        isOpen={isFlyoutOpen}
        className="-left-10 top-20 m-0 py-8"
        itemWrapperClassName="space-y-6 p-0"
        items={[
          <Fragment key={useId()}>
            {sortProps.order && (
              <button
                className="flex h-fit items-center justify-start rounded-none px-12 py-5 text-base font-normal !text-slate-500 transition-colors hover:bg-slate-50"
                onClick={() => {
                  onSort(null)
                  setIsFlyoutOpen(false)
                }}
              >
                <svg
                  className="mr-10 size-20 p-0"
                  height="100%"
                  width="100%"
                  focusable="false"
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="rgba(0, 0, 0, 0.54)"
                  strokeWidth={2}
                >
                  <path d="M5 13h14v-2H5zm-2 4h14v-2H3zM7 7v2h14V7z"></path>
                </svg>
                Clear sort
              </button>
            )}
            <Button
              className="flex h-fit items-center justify-start rounded-none px-12 py-5 !text-slate-500 transition-colors hover:bg-slate-50"
              variant="link"
              btnText={`Sort by ${columnHeader.header} ascending`}
              iconName="bar-chart-02"
              iconClassName="rotate-90 p-0 mr-10"
              iconColor={"rgba(0, 0, 0, 0.54)"}
              clicked={() => {
                onSort("asc")
                setIsFlyoutOpen(false)
              }}
            />
            <Button
              className="flex h-fit items-center justify-start rounded-none px-12 py-5 !text-slate-500 transition-colors hover:bg-slate-50"
              variant="link"
              btnText={`Sort by ${columnHeader.header} descending`}
              iconName="bar-chart-03"
              iconClassName="rotate-90 p-0 mr-10"
              iconColor={"rgba(0, 0, 0, 0.54)"}
              clicked={() => {
                onSort("desc")
                setIsFlyoutOpen(false)
              }}
            />
            <hr />
            <Button
              className="flex h-fit items-center justify-start rounded-none px-12 py-5 !text-slate-500 transition-colors hover:bg-slate-50"
              variant="link"
              btnText={`Filter by ${columnHeader.header}`}
              iconName="filter-lines"
              iconClassName="p-0 mr-10"
              iconColor={"rgba(0, 0, 0, 0.54)"}
              clicked={() => {
                onFilter()
                setIsFlyoutOpen(false)
              }}
            />
          </Fragment>,
        ]}
        itemsAlign="right"
        controllingComponent={[
          <Fragment key={useId()}>
            <ButtonIcon
              iconName="dots-vertical"
              iconSize="17"
              className="btn-icon !mr-5 flex items-center justify-center"
              iconColor={variables.gray300}
              clicked={() => setIsFlyoutOpen(!isFlyoutOpen)}
            />
          </Fragment>,
        ]}
      />
    </>
  )
}

export default FlyoutMenu
