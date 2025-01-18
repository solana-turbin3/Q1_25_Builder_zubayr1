import wallet from "../wba-wallet.json";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createGenericFile,
  createSignerFromKeypair,
  signerIdentity,
} from "@metaplex-foundation/umi";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";

// Create a devnet connection
const umi = createUmi("https://api.devnet.solana.com");

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(irysUploader());
umi.use(signerIdentity(signer));

(async () => {
  try {
    // Follow this JSON structure
    // https://docs.metaplex.com/programs/token-metadata/changelog/v1.0#json-structure

    const image =
      "https://devnet.irys.xyz/cKWQFBJqdaTghU43DUZjDJZUJ5VGGi1euExX3Wbs57L";
    const metadata = {
      name: "jeffSwag",
      symbol: "JS",
      description: "Jeff pulling unnecessary swag",
      image: image,
      attributes: [{ trait_type: "swag", value: "none" }],
      properties: {
        files: [
          {
            type: "image/png",
            uri: image,
          },
        ],
      },
      creators: [
        {
          address: keypair.publicKey,
          verified: true,
          share: 100,
        },
      ],
    };
    const file = createGenericFile(JSON.stringify(metadata), `metadata.json`);

    const [myUri] = await umi.uploader.upload([file]);
    console.log("Your metadata URI: ", myUri);
  } catch (error) {
    console.log("Oops.. Something went wrong", error);
  }
})();

// Your metadata URI:  https://arweave.net/4xMDc3rmF8i5jNSfTEHi9PdiiyXQ61sDNgxKrQobyxhz
// Done in 61.81s.
