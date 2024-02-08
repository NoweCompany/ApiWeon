import app from './app';
import { testConnections } from './database';

testConnections();

const port = process.env.SERVER_PORT;

app.listen(port, () => {
  console.log(`Server is running in -> http://localhost:${port}`);
});
