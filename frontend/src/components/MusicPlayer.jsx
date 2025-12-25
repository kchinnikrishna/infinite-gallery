import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MusicPlayer = () => {
    const [audioFile, setAudioFile] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const audioRef = useRef(null);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setAudioFile(url);
            setIsPlaying(true);
            setIsExpanded(false);
            if (audioRef.current) {
                audioRef.current.src = url;
                audioRef.current.play();
            }
        }
    };

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    return (
        <div className="fixed bottom-8 left-8 z-40 flex flex-col items-start gap-2">
            <audio ref={audioRef} loop onEnded={() => setIsPlaying(false)} />

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        className="bg-black/60 backdrop-blur-xl border border-white/10 p-4 rounded-2xl mb-2 shadow-2xl w-64"
                    >
                        <h3 className="text-white font-bold mb-2 text-sm">Background Ambience</h3>
                        <p className="text-xs text-white/50 mb-3">Select a local MP3/WAV file to play.</p>

                        <input
                            type="file"
                            accept="audio/*"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="text-xs text-white/70 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20 mb-2 cursor-pointer w-full"
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                onClick={() => !audioFile ? setIsExpanded(!isExpanded) : togglePlay()}
                onContextMenu={(e) => { e.preventDefault(); setIsExpanded(!isExpanded); }}
                className={`flex items-center gap-3 px-4 py-3 rounded-full backdrop-blur-md shadow-lg transition-all border border-white/10 group ${isPlaying
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : 'bg-black/40 text-white/70 hover:bg-black/60'
                    }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                {isPlaying ? (
                    <div className="flex gap-1 h-3 items-end">
                        <motion.div animate={{ height: [4, 12, 4] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-1 bg-emerald-400 rounded-full" />
                        <motion.div animate={{ height: [8, 4, 12] }} transition={{ repeat: Infinity, duration: 0.7 }} className="w-1 bg-emerald-400 rounded-full" />
                        <motion.div animate={{ height: [6, 10, 6] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1 bg-emerald-400 rounded-full" />
                    </div>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 18V5l12-2v13"></path>
                        <circle cx="6" cy="18" r="3"></circle>
                        <circle cx="18" cy="16" r="3"></circle>
                    </svg>
                )}

                <span className="text-sm font-medium">
                    {isPlaying ? 'Playing' : (audioFile ? 'Paused' : 'Add Music')}
                </span>

                {audioFile && (
                    <div
                        onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                        className="ml-1 p-1 hover:bg-white/10 rounded-full"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50">
                            <polyline points="18 15 12 9 6 15"></polyline>
                        </svg>
                    </div>
                )}
            </motion.button>
        </div>
    );
};

export default MusicPlayer;
