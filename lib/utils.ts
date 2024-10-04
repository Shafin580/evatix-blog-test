import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface TextInputFieldInterface {
  value: string;
  required: boolean;
  minLength?: number;
  maxLength?: number;
  isEmail: boolean;
}

export const validateTextInputField = ({
  value = "",
  required = true,
  minLength = 2,
  maxLength = 100,
  isEmail,
}: TextInputFieldInterface) => {
  if (required && value?.trim().length === 0 && !isEmail) {
    return { status: false, message: "This field is required" };
  }
  if (value?.trim().length < minLength && !isEmail) {
    return {
      status: false,
      message: `This field should be at least ${minLength} characters`,
    };
  }
  if (value?.trim().length > maxLength && !isEmail) {
    return {
      status: false,
      message: `This field should be at most ${maxLength} characters`,
    };
  }
  if (isEmail && (!value?.includes("@") || !value?.includes("."))) {
    return { status: false, message: "Please enter a valid email address" };
  }
  if (isEmail) {
    //check email address using regular expression
    const emailRegex =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!emailRegex.test(value)) {
      return { status: false, message: "Please enter a valid email address" };
    }
  }
  return { status: true, message: "" };
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onloadend = () => {
      if (reader.result) {
        resolve(reader.result.toString()); // Resolve with base64 string
      } else {
        reject(new Error("FileReader failed to read the file."));
      }
    };

    reader.onerror = (error) => {
      reject(error); // Reject if there's an error
    };
  });
};
