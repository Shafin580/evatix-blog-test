import { HTMLAttributeAnchorTarget, Key, memo, MouseEvent, MouseEventHandler, useCallback } from "react"
import Link from "next/link"
import { Url } from "node:url"
import { cn } from "@/lib/utils"
import Icon, { IconProps } from "./Icon"

interface ButtonParams {
  btnText?: string
  isDisabled?: boolean
  disabledClass?: string
  variant?: "primary" | "secondary" | "success" | "warning" | "danger" | "info" | "neutral" | "link"
  outline?: boolean
  rounded?: boolean
  fullWidth?: boolean
  hasSpinner?: boolean
  spinnerSize?: "sm" | "md" | "lg"
  size?: "sm" | "md" | "lg"
  iconClassName?: string
  iconName?: IconProps["iconName"]
  iconSize?: string
  iconPos?: "left" | "right"
  iconStrokeWidth?: string
  iconColor?: string
  type?: "reset" | "submit" | "button"
  className?: string
  textClassName?: string
  clicked?: MouseEventHandler<HTMLElement>
  renderAs?: "a" | "Link"
  anchor?: {
    key?: Key | null
    href: string
    target?: HTMLAttributeAnchorTarget
    rel?: string
    id?: string
  }
  link?: {
    key?: Key | null
    href: string | Url
    target?: HTMLAttributeAnchorTarget
    replace?: true
    rel?: string
    id?: string
  }
}
export type ButtonProps =
  | (ButtonParams & {
      renderAs: "a"
      anchor: ButtonParams["anchor"]
      link?: never
    })
  | (ButtonParams & {
      renderAs: "Link"
      link: ButtonParams["link"]
      anchor?: never
    })
  | (ButtonParams & {
      clicked: ButtonParams["clicked"]
      renderAs?: never
      anchor?: never
      link?: never
    })

/**
 * A customizable Button component that can be rendered as a button, a link or a react-router Link component.
 *
 * @param {string} [btnText] - The text to be displayed in the button
 * @param {boolean} [isDisabled] - Disables the button
 * @param {string} [disabledClass] - Pass any additional classes for disabled state
 * @param {string} [variant] - Button color variant: `primary`, `secondary`, `success`, `warning`, `danger`, `info`, `neutral`, `link`
 * @param {boolean} [outline] - Ghost button
 * @param {boolean} [fullWidth] - Render to full width of parent
 * @param {boolean} [hasSpinner] - Render a spinner inside the button on the left, replaces left icon if any
 * @param {string} [className] - Pass any additional classes
 * @param {string} [iconPos] - Left(default) or right
 * @param {string} [size] - Button sizes: `sm`, `md`, `lg`
 * @param {string} [iconClassName] - Use this to add a class into the svg in the nested Icon component
 * @param {string} [iconName] - Use icon sprite file: untitled-ui-sprite.svg
 * @param {string} [iconSize] - Use pixel values
 * @param {string} [iconStroke] - Use pixel values
 * @param {string} [iconColor] - Use hex colors
 * @param {string} [type] - Set button type to `reset`, `submit` or `button`(default)
 * @param {VoidFunction} clicked - Returns the clicked event to parent
 * @param {string} [renderAs] - Render as an `<a>`(anchor tag) or `<Link>` component from next/link
 * @param {{}} [anchor] - Anchor tag props, required if renderAs is set to `'a'`
 * @param {Key | null} [anchor.key] - React key property
 * @param {string} [anchor.href] - URL for the anchor
 * @param {HTMLAttributeAnchorTarget} [anchor.target] - Target attribute for the anchor
 * @param {string} [anchor.rel] - Rel attribute for the anchor
 * @param {string} [anchor.id] - ID attribute for the anchor
 * @param {{}} [link] - Next/link props, required if renderAs is set to `'Link'`
 * @param {Key | null} [link.key] - React key property
 * @param {string | Url} [link.href] - URL for the link
 * @param {HTMLAttributeAnchorTarget} [link.target] - Target attribute for the link
 * @param {string | Url} [link.as] - URL for the server
 * @param {boolean} [link.replace] - Replace the current history entry instead of adding a new one
 * @param {string} [link.rel] - Rel attribute for the link
 * @param {string} [link.id] - ID attribute for the link
 *
 */

const Button = memo(function Button({
  rounded = true,
  isDisabled = false,
  disabledClass = "",
  btnText = "Button",
  fullWidth = false,
  hasSpinner = false,
  spinnerSize = "md",
  variant = "primary",
  size = "md",
  outline = false,
  iconClassName = "",
  iconColor = "currentColor",
  iconName = "",
  iconSize = "16px",
  iconPos = "left",
  iconStrokeWidth = "2px",
  type = "button",
  className = "",
  textClassName = "",
  clicked,
  renderAs = undefined,
  anchor = {
    key: undefined,
    href: "#",
    target: undefined,
    rel: undefined,
    id: undefined,
  },
  link = {
    key: undefined,
    href: "#",
    target: undefined,
    replace: undefined,
    rel: undefined,
    id: undefined,
  },
}: ButtonProps) {
  const handleClick = useCallback(
    (_event: any) => {
      clicked?.(_event)
    },
    [clicked]
  )

  const ConditionalContent = () => {
    return (
      <>
        {iconName.length > 0 && iconPos == "left" && size == "sm" && !hasSpinner ? (
          <Icon
            iconName={iconName}
            iconSize="14px"
            iconColor={iconColor}
            iconStrokeWidth={iconStrokeWidth}
            className={cn(
              "pointer-events-none mr-4",
              isDisabled && "hover:cursor-not-allowed",
              iconClassName
            )}
          />
        ) : (
          ""
        )}

        {iconName.length > 0 && iconPos == "left" && size == "md" && !hasSpinner ? (
          <Icon
            iconName={iconName}
            iconSize={iconSize}
            iconColor={iconColor}
            iconStrokeWidth={iconStrokeWidth}
            className={cn(
              "pointer-events-none mr-6",
              isDisabled && "hover:cursor-not-allowed",
              iconClassName
            )}
          />
        ) : (
          ""
        )}

        {iconName.length > 0 && iconPos == "left" && size == "lg" && !hasSpinner ? (
          <Icon
            iconName={iconName}
            iconSize={iconSize}
            iconColor={iconColor}
            iconStrokeWidth={iconStrokeWidth}
            className={cn(
              "pointer-events-none mr-6",
              isDisabled && "hover:cursor-not-allowed",
              iconClassName
            )}
          />
        ) : (
          ""
        )}

        {/* //+ Button Text */}
        <span className={cn("whitespace-nowrap leading-0", textClassName)}>{btnText}</span>

        {iconName.length > 0 && iconPos == "right" && size == "sm" && !hasSpinner ? (
          <Icon
            iconName={iconName}
            iconSize="14px"
            iconColor={iconColor}
            iconStrokeWidth={iconStrokeWidth}
            className={cn(
              "pointer-events-none ml-4",
              isDisabled && "hover:cursor-not-allowed",
              iconClassName
            )}
          />
        ) : (
          ""
        )}

        {iconName.length > 0 && iconPos == "right" && size == "md" && !hasSpinner ? (
          <Icon
            iconName={iconName}
            iconSize={iconSize}
            iconColor={iconColor}
            iconStrokeWidth={iconStrokeWidth}
            className={cn(
              "pointer-events-none ml-6",
              isDisabled && "hover:cursor-not-allowed",
              iconClassName
            )}
          />
        ) : (
          ""
        )}

        {iconPos == "right" && size == "lg" && !hasSpinner ? (
          <Icon
            iconName={iconName}
            iconSize={iconSize}
            iconColor={iconColor}
            iconStrokeWidth={iconStrokeWidth}
            className={cn(
              "pointer-events-none ml-6",
              isDisabled && "hover:cursor-not-allowed",
              iconClassName
            )}
          />
        ) : (
          ""
        )}
      </>
    )
  }

  const defaultStyles = cn(
    "inline-flex items-center justify-center font-normal leading-none focus-visible:outline-0",

    //=> Sizes
    {
      "h-8 px-12 text-sm": size === "sm",
      "h-10 px-16 text-sm md:text-base": size === "md",
      "h-12 px-24 text-sm md:text-base": size === "lg",
    },

    //=> When Not Disabled
    !isDisabled &&
      cn(
        //=> Variants
        {
          "btn-primary": variant === "primary",
          "btn-secondary": variant === "secondary",
          "btn-success": variant === "success",
          "btn-danger": variant === "danger",
          "btn-warning": variant === "warning",
          "btn-info": variant === "info",
          "btn-neutral": variant === "neutral",
          "btn-link": variant === "link",
          disabledClass: disabledClass.length,
        },

        //=> Outline styles
        outline && {
          "btn-primary-outline": variant == "primary",
          "btn-secondary-outline": variant == "secondary",
          "btn-success-outline": variant == "success",
          "btn-danger-outline": variant == "danger",
          "btn-warning-outline": variant == "warning",
          "btn-info-outline": variant == "info",
          "btn-neutral-outline": variant == "neutral",
          "btn-link-outline": variant == "link",
        }
      ),

    //=> When Disabled
    isDisabled &&
      cn(
        "btn-disabled",
        {
          "btn-disabled-outline": outline,
          "!text-gray-300 !bg-transparent": variant === "link",
        },
        hasSpinner == false
      ),

    fullWidth && "!w-full",
    rounded && "rounded-md",
    className
  )

  return renderAs === "a" ? (
    <a
      key={anchor.key}
      href={anchor.href}
      target={anchor.target}
      rel={anchor.rel}
      className={defaultStyles}
      id={anchor.id}
      onClick={handleClick}
    >
      <ConditionalContent />
    </a>
  ) : renderAs === "Link" ? (
    <Link
      key={link.key}
      href={link.href}
      target={link.target}
      replace={link.replace}
      rel={link.rel}
      className={defaultStyles}
      id={link.id}
      onClick={handleClick}
    >
      <ConditionalContent />
    </Link>
  ) : (
    // * default render as button
    <button disabled={isDisabled} type={type} onClick={handleClick} className={defaultStyles}>
      <ConditionalContent />
    </button>
  )
})

export default Button
