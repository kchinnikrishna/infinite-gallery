import { set, get, del } from 'idb-keyval';

const CACHE_KEY = 'infinite-gallery-local-images';

export const saveImagesToCache = async (images) => {
    // We can't save full File objects easily in all browsers, but we cause save Blobs or meta.
    // For a local app, saving the File object usually works in IDB depending on browser support.
    // We will verify this. If not, we warn.
    try {
        // Strip out the volatile blob URLs before saving (they expire)
        const serializable = images.map(img => ({
            id: img.id,
            filename: img.filename,
            file: img.file || null // We need the original File object if we have it
        }));
        await set(CACHE_KEY, serializable);
        console.log('Images cached to IndexedDB');
    } catch (err) {
        console.error('Failed to cache images:', err);
    }
};

export const loadImagesFromCache = async () => {
    try {
        const cached = await get(CACHE_KEY);
        if (!cached || cached.length === 0) return null;

        // Re-create Blob URLs
        return cached.map(item => {
            // Check if we have the File object stored
            if (item.file instanceof Blob) { // File inherits from Blob
                const url = URL.createObjectURL(item.file);
                return {
                    ...item,
                    thumbnail: url,
                    url: url
                };
            }
            return null;
        }).filter(Boolean);
    } catch (err) {
        console.error('Failed to load cached images:', err);
        return null;
    }
};

export const clearImageCache = async () => {
    await del(CACHE_KEY);
};
