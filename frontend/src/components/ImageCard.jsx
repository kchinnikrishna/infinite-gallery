import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useInView } from 'framer-motion';

const ImageCard = ({ image, index = 0, onClick }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "20%" }); // Optimized margin

    // Performance: Removed internal `useScroll` parallax as it causes heavy reflows in Virtual Grids
    // kept the tilt effect but made it lighter

    // Mouse Interaction
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseX = useSpring(x, { stiffness: 500, damping: 30 });
    const mouseY = useSpring(y, { stiffness: 500, damping: 30 });

    const rotateX = useTransform(mouseY, [-0.5, 0.5], ["10deg", "-10deg"]); // Increased tilt
    const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-10deg", "10deg"]);

    const handleMouseMove = (e) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseXVal = e.clientX - rect.left;
        const mouseYVal = e.clientY - rect.top;
        const xPct = mouseXVal / width - 0.5;
        const yPct = mouseYVal / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    const [hasError, setHasError] = useState(false);

    // Deterministic gradient based on index/filename to make fallbacks look designed
    const gradients = [
        'from-purple-900 to-blue-900',
        'from-emerald-900 to-teal-900',
        'from-rose-900 to-amber-900',
        'from-indigo-900 to-slate-900',
        'from-fuchsia-900 to-pink-900'
    ];
    const fallbackGradient = gradients[index % gradients.length];

    if (hasError) {
        return (
            <motion.div
                ref={ref}
                className={`group relative overflow-hidden bg-gradient-to-br ${fallbackGradient} break-inside-avoid shadow-2xl w-full h-full flex items-center justify-center`}
                style={{ perspective: 1200 }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                <div className="text-white/20 font-mono text-xs p-4 text-center break-all">
                    {image.filename}<br />(Load Failed)
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            ref={ref}
            className="group relative overflow-hidden bg-zinc-900 break-inside-avoid shadow-2xl transition-all duration-300 w-full h-full"
            onClick={() => onClick(image)}
            initial={{ opacity: 1, scale: 1, y: 0 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            style={{ perspective: 1200 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            <motion.div
                style={{
                    rotateX,
                    rotateY,
                    transformStyle: "preserve-3d",
                }}
                className="w-full h-full"
            >
                <div className={`aspect-auto w-full relative overflow-hidden h-full bg-zinc-900`}>

                    {/* Layer 1: Blurred Background Fill (solves "no black spaces") */}
                    <div className="absolute inset-0 z-0 h-full w-full opacity-60">
                        <img
                            src={image.thumbnail}
                            alt=""
                            className="block w-full h-full object-cover blur-2xl scale-125"
                            loading="eager"
                            decoding="sync"
                        />
                    </div>

                    {/* Layer 2: Fitted Main Image (solves "so much cropped") */}
                    <div className="absolute inset-0 z-10 h-full w-full flex items-center justify-center p-1">
                        <img
                            src={image.thumbnail}
                            alt={image.filename}
                            className="block max-w-full max-h-full object-contain drop-shadow-xl"
                            loading="eager"
                            decoding="sync"
                            onError={(e) => {
                                console.warn("Image load failed:", image.filename);
                                setHasError(true);
                            }}
                        />
                    </div>

                    {/* Placeholder for layout since absolute image doesn't take space */}
                    <img src={image.thumbnail} className="invisible w-full h-auto" alt="" />

                    {/* Gloss/Sheen Effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none mix-blend-overlay z-10" />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 transform translate-z-20 z-20">
                        <p className="text-white font-semibold tracking-wide truncate opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-75 drop-shadow-lg">
                            {image.filename}
                        </p>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default React.memo(ImageCard, (prev, next) => {
    return prev.image.id === next.image.id && prev.index === next.index;
});
