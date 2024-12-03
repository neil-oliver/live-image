const express = require('express');
const sharp = require('sharp');

const app = express();
const port = 3000;

app.get('/current-time.png', async (req, res) => {
    const currentTime = new Date().toLocaleTimeString();

    const svgImage = `
        <svg width="300" height="100" xmlns="http://www.w3.org/2000/svg">
            <rect width="300" height="100" fill="white"/>
            <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="24" fill="black">
                ${currentTime}
            </text>
        </svg>
    `;

    // Convert the SVG to PNG using sharp
    const buffer = await sharp(Buffer.from(svgImage))
        .png()
        .toBuffer();

    res.setHeader('Content-Type', 'image/png');
    res.send(buffer);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
