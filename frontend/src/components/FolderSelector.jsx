import React, { useState, useEffect, useRef } from 'react';
import { useConfig } from '../hooks/useImages';

const FolderSelector = ({ onFolderSelect }) => {
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const imageFiles = files.filter(file =>
            file.type.startsWith('image/') ||
            /\.(jpg|jpeg|png|gif|webp|avif)$/i.test(file.name)
        );

        if (imageFiles.length > 0) {
            const images = imageFiles.map(file => ({
                id: file.name,
                filename: file.name,
                file: file,
                thumbnail: URL.createObjectURL(file), // Create blob URL
                url: URL.createObjectURL(file)       // Full image is same blob
            }));
            onFolderSelect(images);
        }
    };

    return (
        <div className="flex gap-2 items-center bg-zinc-900/50 p-1.5 rounded-full border border-white/10 backdrop-blur-md cursor-pointer group hover:bg-zinc-800 transition-colors">
            <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-1.5 text-sm text-white font-medium focus:outline-none"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <folder-icon></folder-icon>
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                </svg>
                <span>Select Folder</span>
            </button>

            <input
                ref={fileInputRef}
                type="file"
                webkitdirectory=""
                directory=""
                multiple
                className="hidden"
                onChange={handleFileChange}
            />
        </div>
    );
};

export default FolderSelector;
