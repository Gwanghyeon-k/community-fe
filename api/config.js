export default function handler(_request, response) {
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('Content-Type', 'application/javascript');
    response.status(200).send(
        `window.__APP_CONFIG__ = ${JSON.stringify({
            API_BASE_URL: process.env.API_BASE_URL || '',
        })};`,
    );
}
