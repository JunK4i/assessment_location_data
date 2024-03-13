import { config } from 'dotenv';
import http from "http";
import {app} from "./app";

if (process.env.NODE_ENV !== 'production') {
  config();
}

const server = http.createServer(app); 

const port = process.env.PORT || 3333;

server.listen(port, () =>
  console.log(`API available on http://localhost:${port}`)
);