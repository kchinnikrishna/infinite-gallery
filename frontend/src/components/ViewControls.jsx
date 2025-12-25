import React from 'react';
import { motion } from 'framer-motion';

const ViewControls = ({ currentMode, onSetMode }) => {
    // modes: 'manual', 'pilot', 'zen'

    return (
        <div className="fixed bottom-8 right-8 z-40 flex gap-4">
            {/* Pilot Mode Button */}
            <ControlButton
                isActive={currentMode === 'pilot'}
                onClick={() => onSetMode(currentMode === 'pilot' ? 'manual' : 'pilot')}
                icon={
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="rotate-45">
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                }
                label="Pilot Mode"
                activeColor="bg-blue-500 text-black shadow-blue-500/50"
            />

            {/* Zen Mode Button */}
            <ControlButton
                isActive={currentMode === 'zen'}
                onClick={() => onSetMode(currentMode === 'zen' ? 'manual' : 'zen')}
                icon={
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M10 8h.01M14 8h.01M10 12h4M10 16h4"></path> {/* Simplified Zen/Peace icon */}
                    </svg>
                }
                label="Zen Mode"
                activeColor="bg-emerald-500 text-black shadow-emerald-500/50"
            />

            {/* Focus Mode Button (New) */}
            <ControlButton
                isActive={currentMode === 'focus'}
                onClick={() => onSetMode(currentMode === 'focus' ? 'manual' : 'focus')}
                icon={
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        {/* Actually let's use a "Focus" / Eye / Target icon */}
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M12 5v2m0 10v2m7-7h-2M7 12H5"></path>
                    </svg>
                }
                label="Focus Mode"
                activeColor="bg-amber-500 text-black shadow-amber-500/50"
            />

            {/* Globe Mode Button (New) */}
            <ControlButton
                isActive={currentMode === 'globe'}
                onClick={() => onSetMode(currentMode === 'globe' ? 'manual' : 'globe')}
                icon={
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="2" y1="12" x2="22" y2="12"></line>
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                    </svg>
                }
                label="Globe Mode"
                activeColor="bg-indigo-500 text-black shadow-indigo-500/50"
            />
        </div>
    );
};

const ControlButton = ({ isActive, onClick, icon, label, activeColor }) => (
    <motion.button
        onClick={onClick}
        className={`relative flex items-center justify-center w-14 h-14 rounded-full shadow-2xl backdrop-blur-md transition-all duration-300 group ${isActive
            ? activeColor
            : 'bg-black/40 text-white border border-white/10 hover:bg-black/60'
            }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
    >
        {icon}

        {/* Tooltip */}
        <span className="absolute bottom-full mb-3 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            {label}
        </span>
    </motion.button>
);

export default ViewControls;
