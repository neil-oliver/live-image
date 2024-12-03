const sharp = require('sharp');

exports.handler = async (event, context) => {
    // Default timezone and locale
    const defaultTimeZone = 'UTC';

    // Extract the user's timezone preference from headers
    const headers = event.headers || {};
    const timeZone = headers['Time-Zone'] || defaultTimeZone;

    // Get the current time in the user's timezone
    const now = new Date();
    const currentTime = new Intl.DateTimeFormat('en-US', {
        timeZone: timeZone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hourCycle: 'h23', // 24-hour format
    }).format(now);

    const [hour, minute, second] = currentTime
        .split(':')
        .map((num) => parseInt(num, 10));

    // Adjust SVG dimensions for 500px width
    const width = 500;
    const height = 200; // Proportional height
    const barWidth = 100; // Adjusted bar width
    const barSpacing = 50; // Space between bars

    const svgImage = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
            <rect width="${width}" height="${height}" fill="white"/>
            <text x="${width / 2}" y="30" text-anchor="middle" font-size="16" fill="black">
                Current Time: ${hour}:${minute}:${second}
            </text>
            <rect x="${barSpacing}" y="${height - (hour / 24) * 150}" width="${barWidth}" height="${(hour / 24) * 150}" fill="#008080" />
            <text x="${barSpacing + barWidth / 2}" y="${height - (hour / 24) * 150 - 10}" text-anchor="middle" font-size="14" fill="black">
                Hour
            </text>
            <rect x="${barSpacing * 2 + barWidth}" y="${height - (minute / 60) * 150}" width="${barWidth}" height="${(minute / 60) * 150}" fill="#FFC107" />
            <text x="${barSpacing * 2 + barWidth + barWidth / 2}" y="${height - (minute / 60) * 150 - 10}" text-anchor="middle" font-size="14" fill="black">
                Minute
            </text>
            <rect x="${barSpacing * 3 + barWidth * 2}" y="${height - (second / 60) * 150}" width="${barWidth}" height="${(second / 60) * 150}" fill="#6A1B9A" />
            <text x="${barSpacing * 3 + barWidth * 2 + barWidth / 2}" y="${height - (second / 60) * 150 - 10}" text-anchor="middle" font-size="14" fill="black">
                Second
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
