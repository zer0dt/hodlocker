import React, { useState, useEffect, useRef } from 'react';
import GifPicker, { TenorImage } from 'gif-picker-react';
import { HiOutlineGif } from "react-icons/hi2";

interface GifModalProps {
    gifUrl: string | undefined,
    setGifUrl: any
}

const GifModal = ({ gifUrl, setGifUrl }: GifModalProps) => {
    const [modalVisible, setModalVisible] = useState(false);
    const modalRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                setModalVisible(false); // Close the modal when clicking outside
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const toggleModal = () => {
        setModalVisible(!modalVisible);
    };

    const handleGifImageClick = (TenorImage: TenorImage) => {
        console.log(TenorImage)
        setGifUrl(TenorImage.url)
        setModalVisible(false)
    }

    return (
        <>
            {gifUrl ? null : (
                <button onClick={toggleModal} className="text-black pr-2" type="button">
                    <HiOutlineGif h={10} w={10} />
                </button>
            )}

            {modalVisible && (
                <div className="fixed inset-0 z-50 overflow-auto bg-gray-500 bg-opacity-75 flex items-center justify-center">
                    <div ref={modalRef} id="default-modal" tabIndex={-1} aria-hidden="true" className="relative bg-white rounded-lg shadow-lg">
                        <div className="p-4 md:p-5 space-y-4">
                            <GifPicker width={'auto'} tenorApiKey={"AIzaSyC5CkU-Qk9mPkWqhs_4z-rTVja0ZPFm0qY"} onGifClick={(TenorImage) => handleGifImageClick(TenorImage)} />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default GifModal;