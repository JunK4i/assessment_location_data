import express from "express";
import cors from "cors";
import * as middleware from "./middleware";
export const app = express();

app.use(cors({ origin: true }));
app.use(express.json());
app.use(express.raw({ type: 'application/vnd.custom-type' }));
app.use(express.text({ type: 'text/html' }));


// healthcheck endpoint
app.get("/", (req, res) => {
  res.status(200).send({ status: "ok" });
});

app.post("/api/location", (req, res) => {
    const { encryptedData } = req.body; 
    if (!encryptedData) {
        return res.status(400).send({ error: "Missing encrypted data" });
    }

    const encryptedDataBuffer = Buffer.from(encryptedData, 'base64');
    const key = Buffer.from(process.env.ENCRYPTION_KEY, 'base64');
    const decryptedData = middleware.decryptData(encryptedDataBuffer, key);

    if (decryptedData) {
        console.log("Decrypted data:", decryptedData);
        res.send({ message: "Data decrypted successfully", data: decryptedData });
    } else {
        res.status(500).send({ error: "Failed to decrypt data" });
    }  });
// app.use("/api", inventoryRouter);

// custom middleware
app.use(middleware.unknownEndpoint);

