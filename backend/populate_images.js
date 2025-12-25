const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const IMAGE_DIR = path.join(__dirname, 'sample_images');

if (!fs.existsSync(IMAGE_DIR)) {
    fs.mkdirSync(IMAGE_DIR);
}

const generateImages = async () => {
    console.log("Generating 50 sample images...");
    for (let i = 0; i < 50; i++) {
        const r = Math.floor(Math.random() * 255);
        const g = Math.floor(Math.random() * 255);
        const b = Math.floor(Math.random() * 255);

        // Random dimensions for variety if we were doing true masonry, 
        // but for now our grid is responsive grid. 
        // Let's stick to consistent aspect ratio or random?
        // Random height: 300 to 600
        const height = Math.floor(Math.random() * 300) + 300;

        const fileName = `image_${i}.jpg`;
        await sharp({
            create: {
                width: 400,
                height: height,
                channels: 4,
                background: { r, g, b, alpha: 1 }
            }
        })
            .jpeg()
            .toFile(path.join(IMAGE_DIR, fileName));

        process.stdout.write('.');
    }
    console.log("\nDone!");
};

generateImages();
