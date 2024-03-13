import { config } from 'dotenv';
import {app} from "./app";

if (process.env.NODE_ENV !== 'production') {
  config();
}

// const server = http.createServer(app); 

const port = process.env.PORT || 3333;

app.listen(port, () =>
  console.log(`API available on http://localhost:${port}`)
);