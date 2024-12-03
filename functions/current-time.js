const sharp = require('sharp');

exports.handler = async (event, context) => {
    const currentTime = new Date().toLocaleTimeString();

    const svgImage = `
        <svg width="300" height="100" xmlns="http://www.w3.org/2000/svg">
            <rect width="300" height="100" fill="white"/>
            <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="24" fill="black">
                ${currentTime}
            </text>
        </svg>
    `;

    try {
        // Convert the SVG to PNG using sharp
        const buffer = await sharp(Buffer.from(svgImage)).png().toBuffer();

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'image/png',
            },
            body: buffer.toString('base64'),
            isBase64Encoded: true, // Required for binary response
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to generate image' }),
        };
    }
};
