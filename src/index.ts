import { config } from 'dotenv';
import {app, wss} from "./app";
import http from "http";

if (process.env.NODE_ENV !== 'production') {
  config();
}

const port = process.env.PORT || 3333;

app.listen(port, () =>
  console.log(`API available on http://localhost:${port}`)
);

// Setup HTTP server and attach Express app
const server = http.createServer(app);
server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (socket) => {
        wss.emit('connection', socket, request);
    });
});