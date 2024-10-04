import { cn } from "@/lib/utils"
import Icon, { IconProps } from "./Icon"
import { MouseEventHandler, memo, useCallback } from "react"

export interface ButtonIconProps {
  btnId?: number
  iconColor?: string
  iconName?: IconProps["iconName"]
  iconSize?: string
  title?: string
  isDisabled?: boolean
  iconClassName?: string
  className?: string
  iconVariant?: "solid" | "stroke" | "filetype"
  hoverClassName?: string
  iconStrokeWidth?: string
  clicked: MouseEventHandler<HTMLElement>
}

/**
 * @interface ButtonIconProps
 * @property {number} [btnId] - The ID of the button.
 * @property {string} [iconColor] - The color of the icon.
 * @property {string} [iconName] - The name of the icon.
 * @property {string} [iconSize] - The size of the icon.
 * @property {string} [title] - The title of the button.
 * @property {boolean} [isDisabled] - Whether the button is disabled.
 * @property {string} [iconClassName] - The class name of the icon.
 * @property {string} [className] - The class
 * @property {string} hoverClassName The class name of the button when hovered
 * @property {string} iconStroke The stroke of the icon
 * @property {function} clicked The function to be called when the button is clicked
 */

const ButtonIcon = memo(function ButtonIcon({
  btnId = 1,
  iconColor = "currentColor",
  iconName = "heart",
  iconSize = "20",
  isDisabled = false,
  title = "",
  hoverClassName = "",
  iconStrokeWidth = "2",
  iconClassName = "",
  className = "",
  iconVariant = "stroke",
  clicked,
}: ButtonIconProps) {
  const handleClick = useCallback(
    (e: any) => {
      if (clicked) {
        e.stopPropagation()
        clicked(e)
        e.preventDefault()
      }
    },
    [clicked]
  )

  return (
    <button
      title={title}
      type="button"
      disabled={isDisabled}
      onClick={(e) => handleClick(e)}
      key={btnId.toString()}
      className={cn(
        "altd-button-icon inline-block outline-none hover:cursor-pointer focus-visible:ring-2 focus-visible:ring-primary",
        className
      )}
    >
      <Icon
        isIconDisabled={isDisabled}
        iconColor={iconColor}
        iconName={iconName}
        className={`${iconClassName} ${hoverClassName}`}
        iconSize={iconSize}
        iconStrokeWidth={iconStrokeWidth}
        title={title}
        variant={iconVariant}
      />
    </button>
  )
})

export default ButtonIcon
