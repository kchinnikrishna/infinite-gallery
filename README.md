# Infinite Gallery 🌌

A next-generation, immersive image viewer that transforms your local photo collection into an infinite, 3D digital experience.

![Infinite Gallery](https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop)
*(Replace this with a screenshot of your app)*

## ✨ Features

### 1. **Infinite Canvas (Pilot Mode)**
- A smooth, momentum-based masonry grid that lets you fly through thousands of photos.
- **Smart Zoom**: Seamlessly transition from a birds-eye view of your entire library to pixel-perfect details.
- **Dynamic Loading**: Optimized for performance, handling large libraries with ease.

### 2. **Focus Mode (Pro)**
- A cinematic, 3D stream of your photos.
- **Pro Speed Controls**: Vertical precision slider to adjust the flow speed.
- **Immersive Atmosphere**: Deep space background with reflective glass aesthetics.
- **Auto-Scroll**: Sit back and watch your memories float by.

### 3. **Sphere Mode (Globe)**
- View your world of photos mapped onto a 3D spinning globe.
- **Interactive**: Drag to spin, scroll to zoom.
- **Performance**: High-performance rendering using direct DOM manipulation.

### 4. **Zen Mode**
- Distraction-free viewing.
- Ambient music player integrated for a complete relaxation experience.

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- A folder of images on your computer

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/infinite-gallery.git
    cd infinite-gallery
    ```

2.  **Install Dependencies**
    ```bash
    # Install Backend
    cd backend
    npm install

    # Install Frontend
    cd ../frontend
    npm install
    ```

3.  **Configure Environment**
    - The backend automatically defaults to scanning `C:/Users/Public/Pictures`.
    - To change this, edit `backend/server.js` or create a `.env` file in `backend/` with:
      ```env
      IMAGE_DIR=C:/Path/To/Your/Images
      PORT=3001
      ```

### Running the App

1.  **Start the Backend API**
    ```bash
    cd backend
    node server.js
    ```
    *(Runs on http://localhost:3001)*

2.  **Start the Frontend App** (in a new terminal)
    ```bash
    cd frontend
    npm run dev
    ```
    *(Accessible at http://localhost:5173)*

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express
- **Image Processing**: Sharp (High-performance image resizing)
- **Persistance**: LocalStorage (for user preferences)

## 🎮 Controls

- **General**: Left Click to Select / Drag to Pan.
- **Focus Mode**: 
    - `Spacebar`: Pause/Resume
    - `Esc`: Exit
    - `Mouse Wheel`: Manual Scrub
- **Globe Mode**: Drag to Rotate.

## 📄 License
MIT License - feel free to use and modify!
