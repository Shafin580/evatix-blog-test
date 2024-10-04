import React from "react"
import Select, { GroupBase } from "react-select"
import { StateManagerProps } from "node_modules/react-select/dist/declarations/src/useStateManager"
import Label, { LabelProps } from "./Label";

export type SelectSingleItemProps = { label: string; value: string; miscData?: any }

interface SelectSingleInterface {
  selectSingleProps: StateManagerProps<SelectSingleItemProps, false, GroupBase<SelectSingleItemProps>>
  labelProps?: LabelProps
  className?: string
}

const SelectSingle = ({ selectSingleProps, labelProps, className }: SelectSingleInterface) => {
  return (
    <div className={className}>
      {labelProps && <Label {...labelProps} />}
      <Select isMulti={false} {...selectSingleProps} />
    </div>
  )
}

export default SelectSingle
