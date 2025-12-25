import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const WelcomeModal = ({ onFolderSelect }) => {
    const [isOpen, setIsOpen] = useState(true); // Default valid for now
    const fileInputRef = useRef(null);

    // Close if we already have images? Controlled by parent usually, but simple internal state is fine for now.

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
                file: file, // Critical for IndexedDB persistence
                thumbnail: URL.createObjectURL(file),
                url: URL.createObjectURL(file)
            }));

            if (onFolderSelect) {
                onFolderSelect(images);
                setIsOpen(false);
            }
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-2xl p-10 shadow-2xl relative overflow-hidden text-center"
                    >
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent pointer-events-none" />

                        <div className="flex justify-center mb-6">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-400 to-blue-600 shadow-lg flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                            </div>
                        </div>

                        <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">
                            Infinite Gallery
                        </h2>
                        <p className="text-zinc-400 mb-8 text-base leading-relaxed max-w-sm mx-auto">
                            Select a local folder to generate your 3D infinite canvas instantly.
                        </p>

                        <div className="space-y-4">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full py-4 bg-white text-black text-sm font-bold uppercase tracking-widest rounded-xl hover:bg-zinc-200 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-white/10 flex items-center justify-center gap-3"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path><line x1="12" y1="11" x2="12" y2="17"></line><line x1="9" y1="14" x2="15" y2="14"></line></svg>
                                Choose Folder
                            </button>

                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-xs text-zinc-600 hover:text-white transition-colors uppercase tracking-widest"
                            >
                                Continue with Sample Data
                            </button>
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            webkitdirectory=""
                            directory=""
                            multiple
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default WelcomeModal;
