import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
// import MasonryGrid from './components/MasonryGrid' // Retired for Infinite Canvas
import InfiniteCanvas from './components/InfiniteCanvas'
import Lightbox from './components/Lightbox'
import FolderSelector from './components/FolderSelector'
import WelcomeModal from './components/WelcomeModal'
import ViewControls from './components/ViewControls'
import HeroScreen from './components/HeroScreen'
import MusicPlayer from './components/MusicPlayer'
import FocusView from './components/FocusView'
import SphereView from './components/SphereView'
import { useImages } from './hooks/useImages'
import { loadImagesFromCache, saveImagesToCache } from './utils/persistence'

function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [showHero, setShowHero] = useState(true);
  const [viewMode, setViewMode] = useState('manual'); // 'manual' | 'pilot' | 'zen' | 'focus' | 'globe'
  const [localImages, setLocalImages] = useState(null);

  const { data: fetchedImages } = useImages();
  const allImages = localImages || fetchedImages;

  // Restore persistence
  useEffect(() => {
    loadImagesFromCache().then(cache => {
      if (cache && cache.length > 0) {
        setLocalImages(cache);
      }
    });
  }, []);

  const handleFolderSelect = (images) => {
    setLocalImages(images);
    saveImagesToCache(images); // Save for next time
  };

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white font-sans selection:bg-white/20 overflow-hidden">
      <AnimatePresence>
        {showHero && (
          <motion.div
            key="hero"
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="fixed inset-0 z-50"
          >
            <HeroScreen onStart={() => setShowHero(false)} images={allImages} />
          </motion.div>
        )}
      </AnimatePresence>

      {!localImages && <WelcomeModal onFolderSelect={handleFolderSelect} />}

      <ViewControls currentMode={viewMode} onSetMode={setViewMode} />
      <MusicPlayer />

      {/* Background Ambience */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900/0 via-[#0a0a0a]/50 to-[#0a0a0a] pointer-events-none z-10" />

      <header className="fixed top-0 left-0 right-0 z-20 pointer-events-none p-6 transition-all duration-300">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row gap-4 justify-between items-start pointer-events-auto">
          <div className="flex items-center gap-3 bg-black/40 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10 shadow-lg">
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-white to-zinc-500" />
            <h1 className="text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
              Infinite Gallery
            </h1>
          </div>

          <FolderSelector onFolderSelect={handleFolderSelect} />
        </div>
      </header>

      <main className="h-screen w-screen overflow-hidden">
        {viewMode === 'focus' ? (
          <FocusView images={allImages} onClose={() => setViewMode('manual')} />
        ) : viewMode === 'globe' ? (
          <SphereView images={allImages} onClose={() => setViewMode('manual')} onImageClick={setSelectedImage} />
        ) : (
          <InfiniteCanvas viewMode={viewMode} externalImages={localImages} onImageClick={setSelectedImage} />
        )}
      </main>

      {selectedImage && (
        <Lightbox image={selectedImage} onClose={() => setSelectedImage(null)} />
      )}
    </div>
  )
}

export default App
