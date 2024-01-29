'use client'

import React, { useEffect, useState } from "react";
import ImageUploading, { ImageListType } from "react-images-uploading";
import { RiImageAddLine } from "react-icons/ri"
import { CiCircleRemove } from 'react-icons/ci'

import { toast } from "sonner";

interface ImageUploaderProps {
  gifUrl: string | undefined,
  setGifUrl: any,
  onImageUpload: (dataURL: string | null) => void;
  isDrawerVisible: boolean
}

export function ImageUploader({ gifUrl, setGifUrl, onImageUpload, isDrawerVisible }: ImageUploaderProps) {
  const [images, setImages] = useState<ImageListType>([]);

  useEffect(() => {
    // Update images state when gifUrl changes
    if (gifUrl) {
      setImages([{ dataURL: gifUrl }]); // Add gifUrl to images state
    } else {
      setImages([]); // Clear images state when gifUrl is empty
    }
  }, [gifUrl]);

  const maxNumber = 1;

  const onChange = (imageList: ImageListType, addUpdateIndex: number[] | undefined) => {
    if (imageList.length === 0) {
      // No image selected
      onImageUpload(null);
    } else {
      // Image selected
      onImageUpload(imageList[0].dataURL as string);
    }
    setImages(imageList);
  };

  const handleRemoveImage = (onImageRemove: (index: number) => void, index: number) => {
    // Call the function to remove the image
    onImageRemove(index);

    // Update the GIF URL state if necessary
    setGifUrl(); // You should pass the appropriate value to setGifUrl if needed
  };

  useEffect(() => {
    // Clear images state when isDrawerVisible becomes false
    if (!isDrawerVisible) {
      setImages([]);
    }
  }, [isDrawerVisible]);

  return (
    <div className="image-uploader">
      <ImageUploading
        multiple={false}
        value={images}
        onChange={onChange}
        maxNumber={maxNumber}
        allowNonImageType={true}
      >
        {({
          imageList,
          onImageUpload,
          onImageUpdate,
          onImageRemove,
          isDragging,
          dragProps,
          errors
        }) => (
          <div className="upload__image-wrapper mt-0 mr-0">
            {imageList.map((image, index) => (
              <div key={index} className="image-item mt-2 max-h-300 w-auto">
                <img src={image.dataURL} className="rounded-l" alt="" />
                <div className="image-item__btn-wrapper flex justify-end pt-2">
                  <CiCircleRemove className="lock-icon h-6 w-6 cursor-pointer mr-1" onClick={() => handleRemoveImage(onImageRemove, index)} />
                </div>
              </div>
            ))}
            <div className="flex items-center mb-0">
              {imageList.length > 0 ?
                null :
                <RiImageAddLine className="lock-icon h-7 w-7 cursor-pointer mr-1" onClick={onImageUpload} {...dragProps} />
              }
            </div>
            {errors && (
              <div>
              {errors.maxNumber && toast.error('Number of selected images exceed maxNumber')}
              {errors.acceptType && toast.error('Your selected file type is not allowed')}
              {errors.maxFileSize && toast.error('Selected file size exceeds maxFileSize')}
              {errors.resolution && toast.error('Selected file does not match your desired resolution')}
          </div>
            )}
          </div>

        )

        }
      </ImageUploading>
    </div>
  );
}