import React, { useMemo } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { useImages } from '../hooks/useImages';
import ImageCard from './ImageCard';

const MasonryGrid = ({ onImageClick }) => {
    const { data: images, isLoading, error } = useImages();

    // Responsive columns logic
    const chunks = useMemo(() => {
        if (!images) return [];
        // Determine column count based on width roughly? 
        // Let's stick to 5 for "Desktop" premium feel. 
        // Tailwind grid-cols-5
        const chunkSize = 5;
        const _chunks = [];
        for (let i = 0; i < images.length; i += chunkSize) {
            _chunks.push(images.slice(i, i + chunkSize));
        }
        return _chunks;
    }, [images]);

    if (isLoading) return <div className="flex h-64 items-center justify-center text-zinc-500 animate-pulse">Scanning library...</div>;
    if (error) return <div className="text-red-400 text-center mt-32 bg-red-900/20 p-4 rounded-lg border border-red-500/20 inline-block">Unable to load images</div>;

    return (
        <Virtuoso
            useWindowScroll
            totalCount={chunks.length}
            className="scrollbar-hide"
            itemContent={(index) => {
                const rowImages = chunks[index];
                return (
                    // Added py-4 to give gap between rows
                    // Forced width to 200vw to enable 2D scrolling/pan feeling
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-4 px-2 w-[200vw] max-w-none">
                        {rowImages.map((img, i) => (
                            <ImageCard key={img.id} image={img} index={i} onClick={onImageClick} />
                        ))}
                    </div>
                );
            }}
        />
    );
};

export default MasonryGrid;
