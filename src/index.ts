import express from "express";
import cors from "cors";
import * as middleware from "./middleware";
import WebSocket from 'ws';
import { config } from 'dotenv';
import http from "http";

// Load environment variables in non-production environments
if (process.env.NODE_ENV !== 'production') {
  config();
}

// Initialize Express app
const app = express();

// Apply middleware for CORS, parsing JSON, and text
app.use(cors({ origin: true }));
app.use(express.json());
app.use(express.raw({ type: 'application/vnd.custom-type' }));
app.use(express.text({ type: 'text/html' }));

// Initialize WebSocket server with no associated HTTP server
const wss = new WebSocket.Server({ noServer: true });

// WebSocket connection handler
wss.on('connection', (socket) => {
    console.log('WebSocket Client Connected');
    socket.on('close', () => console.log('Client disconnected'));
});

// Healthcheck endpoint
app.get("/", (req, res) => {
  res.status(200).send({ status: "ok" });
});

// Endpoint for receiving and broadcasting decrypted data
app.post("/api/location", async (req, res) => {
  try {
    const { encryptedData } = req.body; 
    if (!encryptedData) {
        return res.status(400).send({ error: "Missing encrypted data" });
    }
    const encryptedDataBuffer = Buffer.from(encryptedData, 'base64');
    const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
    const decryptedData = await middleware.decryptData(encryptedDataBuffer, key);
    if (decryptedData) {
        console.log("Decrypted data:", decryptedData);
        // Broadcast the decrypted data to all connected WebSocket clients
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(decryptedData));
            }
        });
        return res.send({ message: "Data decrypted successfully", data: decryptedData });
    } else {
        return res.status(500).send({ error: "Failed to decrypt data" });
    }
} catch (error) {
    console.error("Failed to decrypt data:", error);
    return res.status(500).send({ error: "Failed to decrypt data" });
}});

// Handle unknown endpoints
app.use(middleware.unknownEndpoint);

// Create an HTTP server and attach the Express app
const server = http.createServer(app);
server.on('upgrade', (request, socket, head) => {
    // Upgrade HTTP requests to WebSocket connections
    wss.handleUpgrade(request, socket, head, (socket) => {
        wss.emit('connection', socket, request);
    });
});

const port = process.env.PORT || 3333;
server.listen(port, () => console.log(`Server running on http://localhost:${port}`));
