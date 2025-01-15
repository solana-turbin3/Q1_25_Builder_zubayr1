import pkg from "bs58";
import dotenv from "dotenv";

const { decode } = pkg;
dotenv.config();

const args = process.env.TO_SECRET_KEY!;

if (!args.length) {
  throw new Error("No key provided");
}

const key = args;
const decoded = decode(key);

console.log(JSON.stringify(Array.from(decoded)));
