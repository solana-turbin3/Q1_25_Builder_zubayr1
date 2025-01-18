import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createSignerFromKeypair,
  signerIdentity,
  generateSigner,
  percentAmount,
} from "@metaplex-foundation/umi";
import {
  createNft,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";

import wallet from "../wba-wallet.json";
import base58 from "bs58";

const RPC_ENDPOINT = "https://api.devnet.solana.com";
const umi = createUmi(RPC_ENDPOINT);

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const myKeypairSigner = createSignerFromKeypair(umi, keypair);
umi.use(signerIdentity(myKeypairSigner));
umi.use(mplTokenMetadata());

const mint = generateSigner(umi);

(async () => {
  let tx = createNft(umi, {
    mint,
    name: "JeffSwag NFT",
    symbol: "JS",
    uri: "https://devnet.irys.xyz/4xMDc3rmF8i5jNSfTEHi9PdiiyXQ61sDNgxKrQobyxhz",
    sellerFeeBasisPoints: percentAmount(100),
    isCollection: false,
  });

  let result = await tx.sendAndConfirm(umi);
  const signature = base58.encode(result.signature);

  console.log(
    `Succesfully Minted! Check out your TX here:\nhttps://explorer.solana.com/tx/${signature}?cluster=devnet`
  );

  console.log("Mint Address: ", mint.publicKey);
})();

// https://explorer.solana.com/tx/2trekAZrTMWwPF3yJ8h9Mnbv5S7wy2tqY5H5fRwrPX6LReKcnHJiCxfVQ8YkAKV2GKiQZyotRd6V6WQ9WfM1kHev?cluster=devnet
// Mint Address:  38SUU7PVJWvzAyU3U7AmmEJSRPb6BrP6vtjAJh33tu3u
// Done in 40.50s.
