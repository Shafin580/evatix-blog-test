"use client"

import TextField from "@/components/TextField"
import { cn } from "@/lib/utils"
import { useState } from "react"

export interface SearchColumnCellProps {
  containerClassName?: string
  placeholder?: string
  onChange: (value: string) => void
}

const SearchColumnCell = ({ containerClassName, placeholder, onChange }: SearchColumnCellProps) => {
  const [searchValue, setSearchValue] = useState("")
  return (
    <TextField
      shellClassName={cn(containerClassName, "bg-transparent")}
      className="mb-5 rounded-none border-x-0 border-t-0 bg-transparent font-normal"
      value={searchValue}
      fieldHeight="sm"
      placeholder={placeholder}
      onChange={(e) => {
        setSearchValue(e.data as string)
        onChange(e.data as string)
      }}
      isRightIconClickable
      rightIconName={searchValue === "" ? undefined : "x"}
      onRightIconClick={() => {
        setSearchValue("")
        onChange("")
      }}
      shouldFocus
    />
  )
}

export default SearchColumnCell
