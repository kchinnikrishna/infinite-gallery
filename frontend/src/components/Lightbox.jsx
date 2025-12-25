import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Lightbox = ({ image, onClose }) => {
    if (!image) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
                onClick={onClose}
            >
                <div
                    className="relative max-w-7xl max-h-screen w-full h-full flex items-center justify-center p-4"
                    onClick={(e) => e.stopPropagation()} // Prevent closing when clicking image area (optional)
                >
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300 z-50 bg-black/50 p-2 rounded-full w-10 h-10 flex items-center justify-center"
                    >
                        &times;
                    </button>
                    <motion.img
                        key={image.url}
                        src={image.url}
                        alt={image.filename}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="max-w-full max-h-full object-contain shadow-2xl rounded-sm"
                    />
                    <div className="absolute bottom-4 left-0 right-0 text-center text-white/50 text-sm">
                        {image.filename}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default Lightbox;
