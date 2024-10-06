import { cn } from "@/lib/utils";
import { isEmpty } from "lodash";
import React, { useEffect, useRef, useState } from "react";
import ButtonIcon from "./ButtonIcon";
import Button from "./Button";

export interface MultipleFileUploadProps {
  // multiple?: boolean;
  // textDragDropArea?: string;
  // clearFiles?: boolean;
  getErrorText?: (text: string) => void;
  errorInterfaceType?: "toast" | "none" | "text";
  btnText?: string;
  getFiles?: (files: File[]) => void;
  onLoadFiles?: File[];
  clearFiles?: boolean;
  allowedFileTypes?: string;
  maxUploadSize?: number;
  previewSize?: "xs" | "sm" | "md" | "lg";
  maxUploadFileNumber?: number;
  isDisabled?: boolean;
  className?: string;
  showCloseButton?: boolean;
  showImageNumber?: boolean;
  isMultiSelected?: boolean;
}

/**
 * @description
/**
/**
 * Interface for the props of a multiple file upload component.
 * @interface MultipleFileUploadProps
 * @property {string} [btnText] - The text to display on the upload button.
 * @property {(files: File[]) => void} [getFiles] - Callback function to handle the uploaded files.
 * @property {files: File[]} [onLoadFiles] - Pre store files if given.
 * @property {string} [allowedFileTypes] - The allowed file types for upload.
 * @property {boolean} [clearFiles] - Command To Clear All Files
 * @property {boolean} [showCloseButton] - Render Close Button of Image
 * @property {boolean} [showImageNumber] - Render Image Number of Image
 * @property {number} [maxUploadSize] - The maximum upload size in bytes.
 * @property {"sm" | "md" | "lg"} [previewSize] - The size of the file preview.
 * @property {number} [maxUploadFileNumber] - The maximum number of files that can be
*/

const MultipleFileUploadCustom = function ({
  // multiple = false,
  // textDragDropArea = 'Drag & drop files here',
  // clearFiles = false,
  btnText = "Upload files",
  getFiles,
  getErrorText,
  errorInterfaceType = "text",
  onLoadFiles = [],
  clearFiles = false,
  allowedFileTypes = "image/png, image/jpeg, image/webp, text/csv",
  previewSize = "sm",
  maxUploadSize = 1,
  maxUploadFileNumber = 10,
  isDisabled,
  className,
  showCloseButton = false,
  showImageNumber = false,
  isMultiSelected = false,
}: MultipleFileUploadProps) {
  const hiddenFileInput = useRef<HTMLInputElement>(null);

  const [preFiles, setPreFiles] = useState<File[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [filesPath, setFilesPath] = useState<string[]>([]);

  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(
    null
  );

  const [isClearFiles, setIsClearFiles] = useState(false);
  const [toastObject, setToastObject] = useState<{ message: string } | null>();
  const [error, setError] = useState<string | null>();

  useEffect(() => {
    if (onLoadFiles.length > 0) {
      setPreFiles(onLoadFiles);
    }
  }, [onLoadFiles]);

  useEffect(() => {
    setIsClearFiles(clearFiles);
  }, [clearFiles]);

  useEffect(() => {
    getFiles && getFiles(files);
  }, [files]);

  useEffect(() => {
    if (isClearFiles) {
      setFiles([]);
      setFilesPath([]);
      setDraggedImageIndex(null);
    }
  }, [isClearFiles]);

  useEffect(() => {
    if (preFiles.length > 0) {
      onLoadChange(preFiles);
    }
  }, [preFiles]);

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        setError(null);
      }, 3500);
    }
  }, [error]);

  // Function To Convert Image to Base 64
  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          reject(new Error("Failed to convert file to base64."));
        }
      };

      reader.onerror = (error) => {
        reject(error);
      };
    });
  }

  // Function To Render On Load Images if Given
  const onLoadChange = (imageFiles: File[]) => {
    setFiles(imageFiles);

    Promise.all(imageFiles.map((file) => fileToBase64(file)))
      .then((dataArray) => {
        setFilesPath(dataArray);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleChange = async (event: any) => {
    event.preventDefault();

    // Cast fileList to File[]
    const fileList: File[] = Array.from(event.target.files);

    if (files.length + fileList.length <= maxUploadFileNumber) {
      if (allowedFileTypes.length > 0) {
        // Ensure validFilesType is typed as File[]
        const validFilesType: File[] = fileList.filter((file: File) =>
          allowedFileTypes.includes(file.type)
        );

        if (validFilesType.length == fileList.length) {
          // Ensure validFilesSize is typed as File[]
          const validFilesSize: File[] = validFilesType.filter(
            (file: File) => file.size <= maxUploadSize * 1000000
          );

          if (validFilesSize.length == validFilesType.length) {
            try {
              // Convert all files to base64 and add them to the state
              const base64Files = await Promise.all(
                validFilesSize.map(fileToBase64)
              );
              setFiles([...files, ...validFilesSize]);
              setFilesPath([...filesPath, ...base64Files]);
            } catch (error) {
              console.error("Error converting files to base64", error);
            }

            if (error === "file size too big" || error === "Wrong file type") {
              setError(null);
            }

            event.target.value = ""; // Reset input
          } else {
            handleError("file size too big");
          }
        } else {
          handleError("Wrong file type");
        }
      }
    } else {
      handleError(`You can't select more than ${maxUploadFileNumber} files`);
    }
  };

  const handleError = (message: string) => {
    if (errorInterfaceType === "toast") {
      setToastObject({ message });
    }
    if (errorInterfaceType === "text") {
      setError(message);
    }
    if (getErrorText) {
      getErrorText(message);
    }
  };

  const handleClick = () => {
    if (hiddenFileInput.current) {
      hiddenFileInput.current.click();
    }
  };
  return (
    <div
      className={cn(
        "altd-multiple-file-upload img-uploader-container space-y-5 text-center",
        className
      )}
    >
      <div
        className={cn(
          "mx-auto mt-3 grid grid-cols-3 justify-center gap-4 px-4",
          {
            "max-w-xs": previewSize == "xs",
            "max-w-sm": previewSize == "sm",
            "max-w-md": previewSize == "md",
            "max-w-lg": previewSize == "lg",
          }
        )}
      >
        {!isEmpty(filesPath)
          ? filesPath.map((file, index) => {
              return (
                // eslint-disable-next-line @next/next/no-img-element
                <div
                  className={cn(
                    "relative",
                    index == -1 ? "col-span-3" : "col-span-1"
                  )}
                  key={index}
                >
                  {showCloseButton && (
                    <ButtonIcon
                      clicked={() => {
                        const newArrayFiles = files.filter(
                          (_, Localindex) => Localindex !== index
                        );
                        const newArrayFilesPath = filesPath.filter(
                          (_, Localindex) => Localindex !== index
                        );
                        setFiles(newArrayFiles);
                        setFilesPath(newArrayFilesPath);
                      }}
                      iconName="x-close"
                      iconSize={index == -1 ? "24" : "20"}
                      className="group/btn absolute right-1 top-1 inline-flex rounded-full bg-white/50 p-1 shadow-md hover:bg-rose-500"
                      iconClassName="group-hover/btn:stroke-white"
                    />
                  )}
                  {showImageNumber && (
                    <div
                      className={cn(
                        "absolute left-4 top-4 flex aspect-square items-center justify-center rounded-full bg-emerald-500 shadow-md",
                        index == 0 ? "w-3" : "w-2"
                      )}
                    >
                      <span className="font-mono text-sm text-white">
                        {index + 1}
                      </span>
                    </div>
                  )}

                  <img
                    key={index}
                    className="aspect-square w-full border border-slate-200 object-cover"
                    src={file}
                    alt="preview"
                    draggable
                    onDragStart={() => setDraggedImageIndex(index)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();

                      if (draggedImageIndex !== null) {
                        const newFilesPath = [...filesPath];
                        const newFiles = [...files];

                        newFilesPath[draggedImageIndex] = filesPath[index];
                        newFiles[draggedImageIndex] = files[index];
                        newFilesPath[index] = filesPath[draggedImageIndex];
                        newFiles[index] = files[draggedImageIndex];
                        setFilesPath(newFilesPath);
                        setFiles(newFiles);

                        setDraggedImageIndex(null);
                      }
                    }}
                  />
                </div>
              );
            })
          : ""}
      </div>

      <div className="info-text">
        {/* <small className="block text-slate-700">Max file size: {maxUploadSize}Mb</small> */}
        {/* <small className="block text-muted-foreground">
          Upload an Image
        </small> */}
        {/* <small className="block text-slate-700">{allowedFileTypes}</small> */}
        {error && <small className="block text-rose-500">{error}</small>}
      </div>
      <input
        type="file"
        ref={hiddenFileInput}
        onChange={(e) => {
          handleChange(e);
        }}
        accept={allowedFileTypes}
        className="hidden"
        multiple={isMultiSelected}
      />
      <Button
        clicked={handleClick}
        className="formBtnWrapper d-flex justify-content-center -ml-3 h-8 bg-green-700 text-white"
        variant="primary"
        btnText={btnText}
        size="sm"
        outline={true}
        iconName="upload-01"
        isDisabled={isDisabled}
      />
    </div>
  );
};

export default MultipleFileUploadCustom;
