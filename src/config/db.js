import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function connectToDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Server is connected to DB');
  } catch (err) {
    console.log('Error connecting to DB');
    console.error(err);
    process.exit(1);
  }
}

export default connectToDB;