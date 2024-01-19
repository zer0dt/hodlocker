'use client';

import React, { useEffect, useState } from "react";
import ImageUploading, { ImageListType } from "react-images-uploading";

import { RiImageAddLine } from "react-icons/ri"
import { CiCircleRemove } from 'react-icons/ci'


interface ImageUploaderProps {
    onImageUpload: (dataURL: string | null) => void;
    isDrawerVisible: boolean
}

export function ImageUploader({ onImageUpload, isDrawerVisible }: ImageUploaderProps) {
  const [images, setImages] = useState([]);

  const maxNumber = 1;

  const onChange = (imageList: ImageListType, addUpdateIndex: number[] | undefined) => {
    if (imageList.length === 0) {
      // No image selected
      onImageUpload(null);
      setImages([]);
      return;
    }
  
    const maxFileSizeInBytes = 1048576; // 1MB
  
    // Check the file size of the first image in the list
    const file = imageList[0].file;
    console.log("file size", file)
    if (file && file.size > maxFileSizeInBytes) {
      // The image file is too large
      alert('Image file is larger than 1MB. Please upload a smaller image.');
      setImages([]);
    } else {
      // Image is within the acceptable size limit
      onImageUpload(imageList[0].dataURL as string);
      setImages(imageList as never[]);
    }
  };

  useEffect(() => {
    // Check if isDrawerVisible becomes false
    if (!isDrawerVisible) {
      // Clear the images state to remove all images
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
        acceptType={['jpg', 'gif', 'png']}
        allowNonImageType={true}
      >
        {({
          imageList,
          onImageUpload,
          onImageUpdate,
          onImageRemove,
          isDragging,
          dragProps
        }) => (
          <div className="upload__image-wrapper mt-0 mr-0">
            {imageList.map((image, index) => (
              <div key={index} className="image-item mt-2 max-h-300 w-auto">
                <img src={image.dataURL} alt=""  />
                <div className="image-item__btn-wrapper flex justify-end pt-2">
                  <CiCircleRemove className="lock-icon h-6 w-6 cursor-pointer mr-1" onClick={() => onImageRemove(index)} />
                </div>
              </div>
            ))}
            <div className="flex items-center mb-0">
              {imageList.length > 0 ? 
                null :
                <RiImageAddLine className="lock-icon h-7 w-7 cursor-pointer mr-1" onClick={onImageUpload} {...dragProps} />
              }
                    
            </div>
          </div>
        )}
      </ImageUploading>
    </div>
  );
}
