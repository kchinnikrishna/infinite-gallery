import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Film Strip Constants
const ITEM_WIDTH = 500; // Physical width of each frame in px
const GAP = 0; // No gap for continuous strip
const TOTAL_SPAN = ITEM_WIDTH + GAP;
const CURVE_STRENGTH = 0.0005; // How fast it curves back Z = -x^2 * k

const FocusView = ({ images, onClose }) => {
    // -- Physics State --
    // We now track "offset" in pixels instead of rotation in degrees
    const offset = useRef(0);
    const velocity = useRef(0);
    const isDragging = useRef(false);
    const lastMouseX = useRef(0);
    const requestRef = useRef();

    // -- Speed Dial State --
    const [speedSetting, setSpeedSetting] = useState(2); // Start slower (relaxed pace)
    const targetSpeedRef = useRef(3.0);
    const autoScroll = useRef(true);

    // Update the Physics Target when UI Slider changes
    // This runs ONCE per slider change, but doesn't break the loop
    useEffect(() => {
        // Map Slider (0-10) to Speed (px/frame)
        // 0 = 0
        // 5 = 6 px/frame
        // 10 = 16 px/frame
        const newTarget = speedSetting === 0 ? 0 : (speedSetting * 1.5 + 1);
        targetSpeedRef.current = newTarget;

        // If user pulls slider up from 0, re-engage auto mechanism
        if (speedSetting > 0 && Math.abs(velocity.current) < 0.5) {
            autoScroll.current = true;
        }
    }, [speedSetting]);

    const [, setTick] = useState(0); // Force re-render for animation

    // ... (rest of effect logic remains same)

    // -- Animation Loop (Runs ONLY Once) --
    useEffect(() => {
        const loop = () => {
            // 1. Friction / Acceleration Logic
            if (!isDragging.current && autoScroll.current) {
                // Cruise to target speed
                const target = targetSpeedRef.current;
                const damping = 0.05; // Smooth acceleration
                velocity.current += (target - velocity.current) * damping;
            } else if (!isDragging.current) {
                // Drag Friction (slow down when user lets go)
                velocity.current *= 0.92;
            }

            // 2. Apply Move
            offset.current -= velocity.current;

            // 3. Stop very small numbers to save CPU
            if (Math.abs(velocity.current) < 0.001) velocity.current = 0;

            setTick(t => t + 1); // TRIGGER RENDER
            requestRef.current = requestAnimationFrame(loop);
        };
        requestRef.current = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(requestRef.current);
    }, []); // Empty dependency array = Persistent Loop

    // -- Interaction Handlers --
    const handleWheel = (e) => {
        // Horizontal scroll simulation
        autoScroll.current = false;
        velocity.current += e.deltaY * 0.5;
    };

    const handleMouseDown = (e) => {
        isDragging.current = true;
        autoScroll.current = false;
        lastMouseX.current = e.clientX;
        velocity.current = 0;
    };

    const handleMouseMove = (e) => {
        if (!isDragging.current) return;
        const dx = e.clientX - lastMouseX.current;
        offset.current += dx * 1.5; // Direct 1:1 feel, slightly accelerated
        lastMouseX.current = e.clientX;
    };

    const handleMouseUp = () => {
        isDragging.current = false;
        // Resume auto-scroll if speed is set, after a delay?
        // For now, let's keep it manual if touched, users can tap speed slider to restart
        if (Math.abs(velocity.current) < 0.5 && speedSetting > 0) {
            autoScroll.current = true;
        }
    };

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === ' ') autoScroll.current = !autoScroll.current; // Space to pause
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);


    // -- Rendering --
    if (!images || images.length === 0) return null;

    // INFINITE STRIP LOGIC
    // We render a window of items around the current offset
    // centerIndex = round(-offset / width)

    // Normalize offset to positive equivalent for modulo math
    // But easier to just render enough copies

    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
    const itemsOnScreen = Math.ceil(viewportWidth / ITEM_WIDTH) + 4; // Buffer

    const centerIndexRaw = -offset.current / TOTAL_SPAN;
    const centerIndex = Math.round(centerIndexRaw);

    const visibleItems = [];

    for (let i = centerIndex - Math.floor(itemsOnScreen / 2); i <= centerIndex + Math.ceil(itemsOnScreen / 2); i++) {
        // Wrap index
        let safeIndex = i % images.length;
        if (safeIndex < 0) safeIndex += images.length;

        const image = images[safeIndex];

        // Calculate Position relative to center of screen
        // global_x = i * span
        // screen_x = global_x + offset
        const globalX = i * TOTAL_SPAN;
        const screenX = globalX + offset.current;

        // Parabolic Curve Logic
        // Z moves back as X moves away from 0
        const dist = Math.abs(screenX);
        const z = -Math.pow(dist, 2) * CURVE_STRENGTH;

        // Rotation: Curve the strip slightly inward
        const rotateY = -screenX * 0.02; // degrees per pixel

        visibleItems.push({
            uniqueId: image.id + '-' + i,
            image,
            x: screenX,
            z: z,
            rotateY: rotateY,
            dist: dist
        });
    }

    // Sort by Z so center overlaps edges (Painter's algo)
    visibleItems.sort((a, b) => b.dist - a.dist);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#050505] overflow-hidden cursor-grab active:cursor-grabbing"
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ perspective: '1200px' }}
        >
            {/* Atmosphere - Deep Space Modern */}
            <div className="absolute inset-0 z-0 bg-[#020205] pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-b from-black via-[#0a0a0f] to-black" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(30,41,59,0.3)_0%,_transparent_70%)]" />
            </div>

            {/* Exit Button */}
            <button
                onClick={onClose}
                className="absolute top-8 right-8 z-[100] text-amber-500/50 hover:text-amber-400 bg-black/50 hover:bg-black/80 backdrop-blur-md rounded-full w-12 h-12 flex items-center justify-center transition-all border border-amber-900/30"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>

            {/* Speed Dial - Vertical Compact */}
            <div
                className="absolute bottom-24 right-8 z-[100] flex flex-col items-center gap-4 bg-black/20 backdrop-blur-sm p-3 rounded-full border border-white/5 opacity-20 hover:opacity-100 transition-all duration-500 ease-out translate-x-4 hover:translate-x-0"
                onMouseDown={e => e.stopPropagation()}
            >
                <div className="text-[9px] font-sans tracking-widest text-zinc-500 uppercase writing-vertical-rl rotate-180">
                    Speed
                </div>

                {/* Visual Track for Vertical Slider */}
                <div className="relative h-32 w-2 flex justify-center">
                    <input
                        type="range"
                        min="0"
                        max="10"
                        step="1"
                        value={speedSetting}
                        onChange={(e) => setSpeedSetting(parseInt(e.target.value))}
                        onMouseDown={(e) => e.stopPropagation()}
                        className="absolute h-32 w-32 -rotate-90 origin-center translate-y-[40px] appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_0_10px_white] [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-white/10 [&::-webkit-slider-runnable-track]:h-1"
                    />
                </div>
            </div>

            {/* 3D Infinite Stream */}
            <div className="relative w-full h-full flex items-center justify-center transform-style-3d">
                {visibleItems.map((item) => {
                    // Focus Calculation (0 = Center)
                    const normalizedDist = Math.min(item.dist / 600, 1); // 0 to 1
                    const isCenter = normalizedDist < 0.2;

                    // Modern Animation Curve
                    // Center item is big and bright. Edges fade fast.
                    const opacity = 1 - Math.pow(normalizedDist, 1.5);
                    const scale = 1 + (1 - normalizedDist) * 0.5; // Scale up to 1.5x at center
                    const zOffset = (1 - normalizedDist) * 300; // Popping out

                    if (opacity < 0.05) return null;

                    return (
                        <div
                            key={item.uniqueId}
                            className="absolute will-change-transform flex flex-col items-center origin-center"
                            style={{
                                transform: `translate3d(${item.x}px, 0, ${item.z + zOffset}px) rotateY(${item.rotateY * 0.5}deg) scale(${scale})`,
                                opacity: opacity,
                                width: ITEM_WIDTH + 'px',
                                height: 'auto',
                                zIndex: Math.floor(1000 - item.dist)
                            }}
                        >
                            {/* MODERN GLASS CARD */}
                            <div className="relative group cursor-pointer transition-all duration-500">

                                {/* Image Container */}
                                <div className="relative overflow-hidden rounded-lg shadow-2xl transition-all duration-500 box-reflect-bottom">
                                    <img
                                        src={item.image.thumbnail}
                                        className="w-full h-full object-cover shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                                        alt=""
                                        draggable="false"
                                    />

                                    {/* Glossy Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-50 pointer-events-none" />

                                    {/* Active Glow */}
                                    {isCenter && (
                                        <div className="absolute inset-0 ring-1 ring-white/50 shadow-[0_0_30px_rgba(255,255,255,0.2)] rounded-lg pointer-events-none" />
                                    )}
                                </div>

                                {/* Reflection Effect (Pseudo) */}
                                <div className="absolute top-full left-0 right-0 h-40 bg-gradient-to-b from-white/10 to-transparent transform scale-y-[-1] opacity-30 mask-image-b-fade pointer-events-none blur-sm mt-2 rounded-lg overflow-hidden">
                                    <img src={item.image.thumbnail} className="w-full h-full object-cover" alt="" />
                                </div>

                            </div>
                        </div>
                    );
                })}
            </div>

            {/* HUD Status */}
            <div className="absolute bottom-6 left-10 text-white/30 text-[10px] font-sans tracking-[0.3em] uppercase flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                Stream Active
            </div>
        </div>
    );
};

export default FocusView;
