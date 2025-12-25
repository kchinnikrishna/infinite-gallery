import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useImages } from '../hooks/useImages';

const HeroScreen = ({ onStart, images: propImages }) => {
    const { data: fetchedImages } = useImages();
    const images = propImages || fetchedImages;

    // Randomly select a few images for the floating memories
    const floatingImages = useMemo(() => {
        if (!images || images.length === 0) return [];
        // Shuffle and pick 6
        const shuffled = [...images].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 6);
    }, [images]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-gradient-to-br from-teal-900 via-slate-900 to-black">
            {/* Ambient Background Blur */}
            <div className="absolute inset-0 bg-[#0f172a]/40 backdrop-blur-3xl" />

            {/* Floating Memories */}
            {floatingImages.map((img, index) => {
                // Random positions roughly around the edges
                const positions = [
                    { top: '10%', left: '10%', rotate: -12 },
                    { top: '15%', right: '15%', rotate: 6 },
                    { bottom: '20%', left: '8%', rotate: 8 },
                    { bottom: '10%', right: '10%', rotate: -5 },
                    { top: '40%', left: '-5%', rotate: -15 }, // Partially off-screen
                    { top: '60%', right: '-5%', rotate: 10 },
                ];
                const pos = positions[index] || { top: '50%', left: '50%', rotate: 0 };

                return (
                    <motion.div
                        key={img.id}
                        className="absolute w-48 h-64 md:w-64 md:h-80 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10"
                        style={{
                            ...pos,
                            zIndex: 1
                        }}
                        initial={{ opacity: 0, scale: 0.8, y: 50 }}
                        animate={{
                            opacity: 0.6,
                            scale: 1,
                            y: [0, -20, 0],
                            rotate: pos.rotate
                        }}
                        transition={{
                            duration: 2,
                            delay: index * 0.2,
                            y: {
                                repeat: Infinity,
                                duration: 5 + Math.random() * 5,
                                ease: "easeInOut"
                            }
                        }}
                    >
                        <img
                            src={img.thumbnail}
                            alt="Memory"
                            className="w-full h-full object-cover filter blur-[1px]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    </motion.div>
                );
            })}

            {/* Central Glass Card */}
            <motion.div
                className="relative z-10 p-1 rounded-[3rem] bg-gradient-to-br from-white/20 to-white/5 shadow-[0_0_40px_-10px_rgba(0,0,0,0.5)] backdrop-blur-xl border border-white/20"
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
                <div className="bg-black/20 rounded-[2.8rem] px-12 py-16 md:px-20 md:py-24 text-center flex flex-col items-center max-w-2xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1 }}
                        className="mb-6"
                    >
                        <div className="w-16 h-16 mx-auto bg-gradient-to-tr from-teal-400 to-blue-500 rounded-2xl shadow-lg mb-6 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-2">
                            Infinite Gallery
                        </h1>
                        <p className="text-lg text-blue-200/80 font-medium tracking-wide uppercase text-xs">
                            Personal & Local
                        </p>
                    </motion.div>

                    <motion.button
                        onClick={onStart}
                        whileHover={{ scale: 1.05, boxShadow: "0 0 30px -5px rgba(255, 255, 255, 0.3)" }}
                        whileTap={{ scale: 0.95 }}
                        className="group relative px-8 py-4 bg-white text-slate-900 rounded-full font-semibold text-lg shadow-xl shadow-white/10 transition-all overflow-hidden"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            Enter Canvas
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </span>
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
};

export default HeroScreen;
