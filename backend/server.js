require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const app = express();
const PORT = process.env.PORT || 3000;
const CONFIG_FILE = path.join(__dirname, 'config.json');

// Default config
let config = {
    imageDir: process.env.IMAGE_DIR || path.join(__dirname, 'sample_images')
};

// Load config from disk
if (fs.existsSync(CONFIG_FILE)) {
    try {
        const savedConfig = JSON.parse(fs.readFileSync(CONFIG_FILE));
        if (savedConfig.imageDir) {
            config.imageDir = savedConfig.imageDir;
        }
    } catch (e) {
        console.error("Failed to load config.json:", e);
    }
}

// Ensure image directory exists
if (!fs.existsSync(config.imageDir)) {
    console.log(`Creating image directory: ${config.imageDir}`);
    fs.mkdirSync(config.imageDir, { recursive: true });
}

app.use(cors());
app.use(express.json());

// Helper: Save config
const saveConfig = () => {
    try {
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
    } catch (e) {
        console.error("Failed to save config:", e);
    }
};

// Helper: Get all image files
const getImages = () => {
    try {
        if (!fs.existsSync(config.imageDir)) return [];
        const files = fs.readdirSync(config.imageDir);
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif'];
        return files.filter(file => {
            const ext = path.extname(file).toLowerCase();
            return imageExtensions.includes(ext);
        });
    } catch (err) {
        console.error("Error reading image directory:", err);
        return [];
    }
};

// Endpoint: Get Current Config
app.get('/api/config', (req, res) => {
    res.json({ path: config.imageDir });
});

// Endpoint: Update Config
app.post('/api/config', (req, res) => {
    const { path: newPath } = req.body;
    if (newPath && fs.existsSync(newPath) && fs.lstatSync(newPath).isDirectory()) {
        config.imageDir = newPath;
        saveConfig();
        console.log(`Image directory changed to: ${config.imageDir}`);
        res.json({ success: true, path: config.imageDir });
    } else {
        res.status(400).json({ error: "Invalid directory path" });
    }
});

// Endpoint: List all images
app.get('/api/images', (req, res) => {
    const images = getImages().map(file => ({
        id: file, // Using filename as ID for simplicity
        filename: file,
        url: `http://localhost:${PORT}/api/image/${encodeURIComponent(file)}`,
        thumbnail: `http://localhost:${PORT}/api/thumb/${encodeURIComponent(file)}`
    }));
    res.json(images);
});

// Endpoint: Get Thumbnail
app.get('/api/thumb/:filename', async (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(config.imageDir, filename);

    if (!fs.existsSync(filePath)) {
        return res.status(404).send('Image not found');
    }

    try {
        const transformer = sharp(filePath)
            .resize({ width: 300, withoutEnlargement: true, kernel: 'nearest' }) // Smaller, faster resize
            .jpeg({ quality: 60, mozjpeg: true }); // Lower quality for speed, mozjpeg for compression

        res.set('Content-Type', 'image/jpeg');
        res.set('Cache-Control', 'public, max-age=31536000'); // Aggressive caching
        transformer.pipe(res);
    } catch (err) {
        console.error("Error generating thumbnail:", err);
        res.status(500).send('Error generating thumbnail');
    }
});

// Endpoint: Get Full Image
app.get('/api/image/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(config.imageDir, filename);

    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).send('Image not found');
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Initial scanning images from: ${config.imageDir}`);
});
