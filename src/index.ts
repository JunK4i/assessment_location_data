import express from "express";
import cors from "cors";
import * as middleware from "./middleware";
import WebSocket from 'ws';
import http from 'http';

// Initialize Express app
export const app = express();

// Apply middleware for CORS, parsing JSON and text
app.use(cors({ origin: true }));
app.use(express.json());
app.use(express.raw({ type: 'application/vnd.custom-type' }));
app.use(express.text({ type: 'text/html' }));

// Initialize WebSocket server with no associated HTTP server
export const wss = new WebSocket.Server({ noServer: true });

// Handle new WebSocket connections
wss.on('connection', (socket) => {
    console.log('WebSocket Client Connected');
    socket.on('close', () => console.log('Client disconnected'));
});

// Define the WebSocket endpoint
// Note: This code has a mistake. Express does not have a native `.ws` method. You'd typically use a library like express-ws to add this support.
app.ws("/api/socket", (ws) => {
    console.log("WebSocket connection established");
    ws.on("message", (message) => {
        console.log("Received message:", message);
        // Process the received message here
    });
    ws.on("close", () => {
        console.log("WebSocket connection closed");
    });
});

// Define a simple healthcheck endpoint
app.get("/", (req, res) => {
  res.status(200).send({ status: "ok" });
});

// Endpoint to receive and decrypt location data, then broadcast
app.post("/api/location", async (req, res) => {
    // Your existing code for decrypting and broadcasting data
});

// Fallback middleware for unknown endpoints
app.use(middleware.unknownEndpoint);

// Start the Express server and handle WebSocket upgrades
const server = http.createServer(app);
server.on('upgrade', (request, socket, head) => {
    // This upgrades HTTP requests to WebSocket connections
    wss.handleUpgrade(request, socket, head, (socket) => {
        wss.emit('connection', socket, request);
    });
});

const port = process.env.PORT || 3333;
server.listen(port, () =>
  console.log(`API and WebSocket server available on http://localhost:${port}`)
);
