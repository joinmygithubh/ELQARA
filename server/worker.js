import http from 'node:http';
import { httpServerHandler } from 'cloudflare:node';
import app from './app.js';

// Create Node HTTP server with Express application
const server = http.createServer(app);
server.listen(8080);

// Export Cloudflare Workers HTTP server handler
export default httpServerHandler({ port: 8080 });
