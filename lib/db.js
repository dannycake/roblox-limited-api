import { QuickDB } from 'quick.db';
const db = new QuickDB({
    filePath: process.env.DB_PATH,
});

export default db;
