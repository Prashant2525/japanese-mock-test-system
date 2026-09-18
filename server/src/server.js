import { assertEnvironment, env } from './config/env.js';
import { connectDatabase } from './config/db.js';
import app from './app.js';

assertEnvironment();
await connectDatabase();

app.listen(env.port, () => {
  console.log(`Dream API listening on http://localhost:${env.port}`);
});

