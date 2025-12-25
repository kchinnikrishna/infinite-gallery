import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useImages } from '../hooks/useImages';
import ImageCard from './ImageCard';
import { motion } from 'framer-motion';

const CELL_WIDTH = 300;
const CELL_HEIGHT = 400;
const GUTTER = -1; // Negative gutter for overlap/seamlessness

const InfiniteCanvas = ({ viewMode, externalImages, onImageClick }) => { // 'manual' | 'pilot' | 'zen'
    const { data: fetchedImages } = useImages();
    const images = externalImages || fetchedImages; // Prioritize local files if available
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const isDragging = useRef(false);
    const lastMousePos = useRef({ x: 0, y: 0 });
    const requestRef = useRef();

    // -- Animation Loop --
    useEffect(() => {
        const loop = () => {
            if (viewMode === 'zen') {
                // -- ZEN MODE: Constant Left-to-Right Scroll --
                const speed = 2.0;
                setOffset(prev => ({
                    x: prev.x - speed,
                    y: prev.y
                }));
            } else if (viewMode === 'pilot') {
                // -- PILOT MODE: Mouse-Guided --
                const { innerWidth, innerHeight } = window;
                const centerX = innerWidth / 2;
                const centerY = innerHeight / 2;
                const mouseMsg = window.currentMousePos || { x: centerX, y: centerY };

                const deltaX = (mouseMsg.x - centerX) * 0.02; // Drastically steeper reduction (was 0.08)
                const deltaY = (mouseMsg.y - centerY) * 0.02;

                if (Math.abs(deltaX) > 0.5 || Math.abs(deltaY) > 0.5) {
                    setOffset(prev => ({
                        x: prev.x - deltaX,
                        y: prev.y - deltaY
                    }));
                }
            }
            // -- MANUAL MODE: No auto-movement --

            requestRef.current = requestAnimationFrame(loop);
        };
        requestRef.current = requestAnimationFrame(loop);

        // Mouse tracking for Pilot Mode
        const updateMouse = (e) => {
            window.currentMousePos = { x: e.clientX, y: e.clientY };
        };
        window.addEventListener('mousemove', updateMouse);

        return () => {
            cancelAnimationFrame(requestRef.current);
            window.removeEventListener('mousemove', updateMouse);
        };
    }, [viewMode]);


    // -- Drag Logic --
    const handleMouseDown = (e) => {
        // Allow drag in manual and pilot, disable in Zen
        if (viewMode === 'zen') return;
        isDragging.current = true;
        lastMousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e) => {
        if (!isDragging.current) return;
        const dx = e.clientX - lastMousePos.current.x;
        const dy = e.clientY - lastMousePos.current.y;

        setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
        lastMousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
        isDragging.current = false;
        document.body.style.cursor = 'default';
    };

    // -- Virtualization Logic --
    const visibleCells = useMemo(() => {
        if (!images || images.length === 0) return [];

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Calculate visible grid range based on offset (camera position)
        // We add buffer cells to ensure smoothness
        const startCol = Math.floor(-offset.x / (CELL_WIDTH + GUTTER)) - 2;
        const endCol = startCol + Math.ceil(viewportWidth / (CELL_WIDTH + GUTTER)) + 4;
        const startRow = Math.floor(-offset.y / (CELL_HEIGHT + GUTTER)) - 2;
        const endRow = startRow + Math.ceil(viewportHeight / (CELL_HEIGHT + GUTTER)) + 4;

        const cells = [];
        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
                // Modulo shuffling to pick image
                // Use absolute coordinates to create a consistent deterministic hash
                // Math.abs needed because row/col can be negative
                const hash = Math.abs((col * 73856093) ^ (row * 19349663));
                const imgIndex = hash % images.length;

                cells.push({
                    key: `${row}-${col}`,
                    image: images[imgIndex],
                    x: col * (CELL_WIDTH + GUTTER),
                    y: row * (CELL_HEIGHT + GUTTER),
                    col, row
                });
            }
        }
        return cells;
    }, [offset, images]);


    if (!images) return (
        <div className="fixed inset-0 flex items-center justify-center bg-zinc-950 text-white z-50">
            <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="opacity-50">Connecting to Neural Network...</p>
            </div>
        </div>
    );

    if (images.length === 0) return (
        <div className="fixed inset-0 flex items-center justify-center bg-zinc-950 text-white z-50">
            <div className="text-center p-8 border border-white/10 rounded-2xl bg-white/5 backdrop-blur-md">
                <h2 className="text-2xl font-bold mb-2">Canvas Empty</h2>
                <p className="opacity-50 mb-4">No images found in the selected folder.</p>
                <div className="opacity-30 text-xs">Try selecting a different folder in the header.</div>
            </div>
        </div>
    );

    return (
        <div
            className="fixed inset-0 overflow-hidden bg-zinc-950"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            <motion.div
                className="absolute top-0 left-0 will-change-transform"
                style={{
                    x: offset.x,
                    y: offset.y
                }}
            >
                {visibleCells.map((cell) => (
                    <div
                        key={cell.key}
                        className="absolute"
                        style={{
                            width: CELL_WIDTH,
                            height: CELL_HEIGHT,
                            transform: `translate(${cell.x}px, ${cell.y}px)`,
                        }}
                    >
                        <ImageCard
                            image={cell.image}
                            // Pass a "virtual" index for stagger, shifting it based on scroll 
                            // to keep animations lively but not constant re-triggering?
                            index={(cell.col + cell.row) % 5}
                            onClick={() => onImageClick && onImageClick(cell.image)}
                        />
                    </div>
                ))}
            </motion.div>

        </div>
    );
};

export default InfiniteCanvas;
