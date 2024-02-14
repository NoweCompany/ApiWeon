import app from './app.js';
import { testConnections } from './database/index.js';

testConnections();

const port = process.env.SERVER_PORT;

app.listen(port, () => {
  console.log(`Server is running in -> http://localhost:${port}`);
});
