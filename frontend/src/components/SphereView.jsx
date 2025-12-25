import React, { useState, useEffect, useRef, useMemo } from 'react';

// JARVIS THEME CONSTANTS
const SPHERE_RADIUS = 600;
const IMAGE_SIZE = 80;
const ITEM_COUNT = 135; // Optimized for FPS

const SphereView = ({ images, onClose, onImageClick }) => {
    // -- Physics State --
    const rotation = useRef({ x: 0, y: 0 });
    const velocity = useRef({ x: 0.05, y: 0.05 }); // Faster Auto-Spin
    const isDragging = useRef(false);
    const lastMouse = useRef({ x: 0, y: 0 });

    // Zoom Physics
    const zoomPos = useRef(-400);
    const zoomVel = useRef(0);

    // Direct DOM Ref
    const sceneRef = useRef(null);
    const requestRef = useRef();

    // Infinite Cycling State
    const poolIndex = useRef(ITEM_COUNT); // Start taking images after the initial set
    const itemRefs = useRef([]); // To access image DOM nodes directly

    const sphereItems = useMemo(() => {
        if (!images || images.length === 0) return [];

        // seamless mosaic approximation (high density)
        const subset = images.slice(0, ITEM_COUNT);
        const phiSpan = Math.PI * (3 - Math.sqrt(5));

        return subset.map((image, i) => {
            const y = 1 - (i / (subset.length - 1)) * 2;
            const radiusAtY = Math.sqrt(1 - y * y);
            const theta = phiSpan * i;
            const phi = Math.acos(y);

            return {
                id: i, // Use numeric ID for array indexing
                image,
                theta,
                phi
            };
        });
    }, [images]);

    // -- Animation Loop --
    useEffect(() => {
        const loop = () => {
            // Rotation Physics
            if (!isDragging.current) {
                // Auto-tumble
                rotation.current.x += velocity.current.x;
                rotation.current.y += velocity.current.y;
            }

            // Zoom Physics
            zoomPos.current += zoomVel.current;
            zoomVel.current *= 0.9; // Zoom damping

            // Zoom Boundaries
            if (zoomPos.current > 800) { zoomPos.current = 800; zoomVel.current = 0; }
            if (zoomPos.current < -2500) { zoomPos.current = -2500; zoomVel.current = 0; }

            // Infinite Cycling Logic (Every 5 frames to save CPU)
            // We check for items on the "Back" of the sphere and swap their textures
            if (images.length > ITEM_COUNT) { // Only if we have more images to show
                const rX = rotation.current.x * (Math.PI / 180);
                const rY = rotation.current.y * (Math.PI / 180);

                // Simple check: Just pick one random item per frame and check if it's hidden
                // This is O(1) instead of O(N) loop
                const randIdx = Math.floor(Math.random() * ITEM_COUNT);
                const item = sphereItems[randIdx];

                if (item) {
                    // Calculate rough Z depth after rotation
                    // Standard 3D point rotation math
                    // x' = x cos θ - z sin θ
                    // z' = x sin θ + z cos θ
                    // We need spherical to cartesian first
                    const cx = SPHERE_RADIUS * Math.sin(item.phi) * Math.cos(item.theta);
                    const cy = SPHERE_RADIUS * Math.sin(item.phi) * Math.sin(item.theta);
                    const cz = SPHERE_RADIUS * Math.cos(item.phi);

                    // Rotate around X axis
                    const y1 = cy * Math.cos(rX) - cz * Math.sin(rX);
                    const z1 = cy * Math.sin(rX) + cz * Math.cos(rX);

                    // Rotate around Y axis
                    const z2 = z1 * Math.cos(rY) - cx * Math.sin(rY);

                    // If z2 is significantly negative, it's on the back face
                    if (z2 < -200) {
                        // SWAP TEXTURE
                        const nextImg = images[poolIndex.current % images.length];
                        const imgNode = itemRefs.current[randIdx];

                        // Check if we actually need to swap (avoid redundant loads)
                        if (imgNode && imgNode.src !== nextImg.thumbnail) {
                            imgNode.src = nextImg.thumbnail;
                            // We also update the 'data-image-index' so click handler knows the correct image
                            imgNode.dataset.imageIndex = poolIndex.current % images.length;

                            poolIndex.current++;
                        }
                    }
                }
            }

            // DIRECT DOM UPDATE (No React Re-render)
            if (sceneRef.current) {
                sceneRef.current.style.transform = `translateZ(${zoomPos.current}px) rotateX(${rotation.current.x}deg) rotateY(${rotation.current.y}deg)`;
            }

            requestRef.current = requestAnimationFrame(loop);
        };
        requestRef.current = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(requestRef.current);
    }, [images]); // Re-bind if images list changes

    // -- Interaction --
    const handleMouseDown = (e) => {
        isDragging.current = true;
        lastMouse.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e) => {
        if (!isDragging.current) return;
        const dx = e.clientX - lastMouse.current.x;
        const dy = e.clientY - lastMouse.current.y;

        rotation.current.y += dx * 0.15;
        rotation.current.x -= dy * 0.15;

        lastMouse.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
        isDragging.current = false;
    };

    const handleWheel = (e) => {
        // Zoom Impulse
        const strength = 3.0; // Faster Zoom
        zoomVel.current -= e.deltaY * strength;
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    if (!images || images.length === 0) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#050505] overflow-hidden cursor-crosshair"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            style={{ perspective: '900px' }}
        >
            {/* JARVIS ATMOSPHERE */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Deep Space Grid */}
                <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(0,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_90%)]" />

                {/* Holographic Rings */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[850px] border border-cyan-500/30 rounded-full animate-spin-slow" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] border border-dashed border-amber-500/20 rounded-full animate-reverse-spin" />
            </div>

            {/* Exit Control (Cyber Style) */}
            <button
                onClick={onClose}
                className="absolute top-8 right-8 z-[100] group flex items-center gap-2 px-4 py-2 border border-cyan-500/50 bg-black/80 text-cyan-400 font-mono text-xs uppercase tracking-widest hover:bg-cyan-500/10 transition-all"
            >
                <span>Terminate</span>
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </button>

            {/* SPHERE ENGINE */}
            <div className="relative w-0 h-0 transform-style-3d">
                <div
                    ref={sceneRef}
                    className="absolute inset-0 transform-style-3d will-change-transform"
                    style={{
                        transform: `translateZ(${zoomPos.current}px) rotateX(${rotation.current.x}deg) rotateY(${rotation.current.y}deg)`
                    }}
                >
                    {sphereItems.map((item, i) => {
                        // Spherical Transform
                        const transform = `rotateY(${item.theta}rad) rotateX(${item.phi - Math.PI / 2}rad) translateZ(${SPHERE_RADIUS}px)`;

                        return (
                            <div
                                key={item.id}
                                className="absolute top-1/2 left-1/2 will-change-transform cursor-pointer"
                                style={{
                                    transform: transform,
                                    width: IMAGE_SIZE + 'px',
                                    height: IMAGE_SIZE + 'px',
                                    marginLeft: `-${IMAGE_SIZE / 2}px`,
                                    marginTop: `-${IMAGE_SIZE / 2}px`
                                }}
                                onClick={(e) => {
                                    // READ REAL-TIME INDEX from DOM because React prop is stale
                                    // If cycled, the DOM dataset has the true index
                                    const realIndex = e.target.dataset.imageIndex || i;
                                    onImageClick(images[realIndex]);
                                }}
                            >
                                {/* Holographic Card - JARVIS Style Restored */}
                                <div className="w-full h-full relative group hover:z-50 border border-cyan-500/30 bg-black/90 transition-all duration-300">
                                    <div className="absolute inset-0 bg-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    <img
                                        ref={el => itemRefs.current[i] = el}
                                        src={item.image.thumbnail}
                                        data-image-index={i} // Store initial index
                                        className="w-full h-full object-cover transition-all duration-300 group-hover:scale-125 backface-hidden opacity-60 grayscale group-hover:opacity-100 group-hover:grayscale-0 saturate-150"
                                        alt=""
                                        loading="eager"
                                        style={{ transform: 'translateZ(0)' }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* HUD FOOTER */}
            <div className="absolute bottom-12 w-full text-center pointer-events-none">
                <div className="inline-flex flex-col items-center gap-1">
                    <div className="text-cyan-500/50 text-[10px] font-mono tracking-[0.5em] uppercase animate-pulse">
                        Z-DEPTH: {Math.round(zoomPos.current)} // SYSTEM ONLINE
                    </div>
                    <div className="h-px w-24 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
                </div>
            </div>
        </div>
    );
};

export default SphereView;
