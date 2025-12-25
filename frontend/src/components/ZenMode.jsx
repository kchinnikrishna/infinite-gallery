import React from 'react';
import { motion } from 'framer-motion';

const ZenMode = ({ onToggle, isActive }) => {
    return (
        <div className="fixed bottom-8 right-8 z-40">
            <motion.button
                onClick={() => onToggle(!isActive)}
                className={`flex items-center justify-center w-14 h-14 rounded-full shadow-2xl backdrop-blur-md transition-all duration-300 group ${isActive
                    ? 'bg-amber-500 text-black shadow-amber-500/50 rotate-90'
                    : 'bg-black/40 text-white border border-white/10 hover:bg-black/60'
                    }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                {isActive ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="translate-x-0.5">
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                )}

                {/* Tooltip */}
                <span className="absolute right-full mr-4 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {isActive ? 'Stop Auto-Scroll' : 'Enable Auto-Scroll'}
                </span>
            </motion.button>
        </div>
    );
};

export default ZenMode;
