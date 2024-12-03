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

    // Generate SVG with bar chart
    const svgImage = `
        <svg width="300" height="150" xmlns="http://www.w3.org/2000/svg">
            <rect width="300" height="150" fill="white"/>
            <text x="150" y="20" text-anchor="middle" font-size="14" fill="black">
                Current Time: ${hour}:${minute}:${second}
            </text>
            <rect x="50" y="${150 - (hour / 24) * 100}" width="50" height="${(hour / 24) * 100}" fill="#008080" />
            <text x="75" y="${150 - (hour / 24) * 100 - 5}" text-anchor="middle" font-size="12" fill="black">
                Hour
            </text>
            <rect x="125" y="${150 - (minute / 60) * 100}" width="50" height="${(minute / 60) * 100}" fill="#FFC107" />
            <text x="150" y="${150 - (minute / 60) * 100 - 5}" text-anchor="middle" font-size="12" fill="black">
                Minute
            </text>
            <rect x="200" y="${150 - (second / 60) * 100}" width="50" height="${(second / 60) * 100}" fill="#6A1B9A" />
            <text x="225" y="${150 - (second / 60) * 100 - 5}" text-anchor="middle" font-size="12" fill="black">
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
