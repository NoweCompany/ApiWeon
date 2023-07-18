import app from './app';
import './database';

const port = process.env.SERVER_PORT;

app.listen(port, () => console.log(`http://localhost:${port}`));
