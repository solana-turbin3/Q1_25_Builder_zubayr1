import fs from "fs";
import { Keypair } from "@solana/web3.js";

//Generate a new keypair
let kp = Keypair.generate();

const publicKey = kp.publicKey.toBase58();
const secretKey = JSON.stringify(Array.from(kp.secretKey));

console.log(`You've generated a new Solana wallet: ${publicKey}`);
console.log(`Your secret Key: [${secretKey}]`);

const data = {
  publicKey: publicKey,
  secretKey: secretKey,
};

// Save to JSON file
fs.writeFile("dev-wallet.json", JSON.stringify(data, null, 2), (err) => {
  if (err) {
    console.error("Error saving the keypair to file", err);
  } else {
    console.log(
      "Wallet saved to dev-wallet.json! DO NOT SHARE SECRET KEY WITH ANYONE!"
    );
  }
});
