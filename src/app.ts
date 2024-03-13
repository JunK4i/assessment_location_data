import express from "express";
import cors from "cors";
import * as middleware from "./middleware";
import WebSocket from 'ws';

export const app = express();

app.use(cors({ origin: true }));
app.use(express.json());
app.use(express.raw({ type: 'application/vnd.custom-type' }));
app.use(express.text({ type: 'text/html' }));

export const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', (socket) => {
    console.log('WebSocket Client Connected');
    socket.on('close', () => console.log('Client disconnected'));
});


// healthcheck endpoint
app.get("/", (req, res) => {
  res.status(200).send({ status: "ok" });
});

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
    }
});



app.use(middleware.unknownEndpoint);

