// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { Cluster, PublicKey } from "@solana/web3.js";
import OneCsIDL from "../target/idl/one_cs.json";
import type { OneCs } from "../target/types/one_cs";

// Re-export the generated IDL and type
export { OneCs, OneCsIDL };

// The programId is imported from the program IDL.
export const ONE_CS_PROGRAM_ID = new PublicKey(OneCsIDL.address);

// This is a helper function to get the OneCs Anchor program.
export function getOneCsProgram(provider: AnchorProvider, address?: PublicKey) {
  return new Program(
    {
      ...OneCsIDL,
      address: address ? address.toBase58() : OneCsIDL.address,
    } as OneCs,
    provider
  );
}

// This is a helper function to get the program ID for the OneCs program depending on the cluster.
export function getOneCsProgramId(cluster: Cluster) {
  switch (cluster) {
    case "devnet":
    case "testnet":
      // This is the program ID for the OneCs program on devnet and testnet.
      return new PublicKey("4LN76xfUPPhhuGgtDrN3nk6pwY37AQ5nhyuTegZoxM4N");
    case "mainnet-beta":
    default:
      return ONE_CS_PROGRAM_ID;
  }
}
