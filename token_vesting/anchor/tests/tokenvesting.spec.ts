import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Keypair, PublicKey } from "@solana/web3.js";
import { NodeWallet } from "@coral-xyz/anchor/dist/cjs/nodewallet";

import {
  ProgramTestContext,
  startAnchor,
  BanksClient,
  Clock,
} from "solana-bankrun";
import { BankrunProvider } from "anchor-bankrun";
import { createMint, mintTo } from "spl-token-bankrun";

import { Tokenvesting } from "../target/types/tokenvesting";

import IDL from "../target/idl/tokenvesting.json";

describe("tokenvesting", () => {
  // Configure the client to use the local cluster.
  let beneficiary: Keypair;
  let employer: Keypair;

  let context: ProgramTestContext;
  let provider: BankrunProvider;
  let program: Program<Tokenvesting>;
  let program2: Program<Tokenvesting>;
  let banksClient: BanksClient;

  let mint: PublicKey;
  let beneficiary_provider: BankrunProvider;

  let vestingAccountKey: PublicKey;
  let treasuryTokenAccountKey: PublicKey;
  let employeeAccountKey: PublicKey;

  beforeAll(async () => {
    beneficiary = new anchor.web3.Keypair();

    context = await startAnchor(
      "",
      [{ name: "vesting", programId: new PublicKey(IDL.address) }],
      [
        {
          address: beneficiary.publicKey,
          info: {
            lamports: 10000000000,
            data: Buffer.alloc(0),
            owner: SYSTEM_PROGRAM_ID,
            executable: false,
          },
        },
      ],
      {
        commitment: "confirmed",
      }
    );

    provider = new BankrunProvider(context);

    anchor.setProvider(provider);

    program = new Program<Tokenvesting>(
      IDL as Tokenvesting,
      provider.programID
    );

    banksClient = context.banksClient;

    employer = provider.wallet.payer;

    // @ts-ignore
    mint = await createMint(banksClient, employer, employer.publicKey, null, 2);

    beneficiary_provider = new BankrunProvider(context);
    beneficiary_provider.wallet = new NodeWallet(beneficiary);

    program2 = new Program<Tokenvesting>(
      IDL as Tokenvesting,
      beneficiary_provider
    );

    [vestingAccountKey] = PublicKey.findProgramAddressSync(
      [Buffer.from("company_name")],
      program.programID
    );

    [treasuryTokenAccountKey] = PublicKey.findProgramAddressSync(
      [Buffer.from("vesting_treasury"), Buffer.from("company_name")],
      program.programID
    );

    [employeeAccountKey] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("employee_vesting"),
        beneficiary.publicKey.toBuffer(),
        vestingAccountKey.toBuffer(),
      ],
      program.programID
    );
  });

  it("Initialize Tokenvesting Account", async () => {
    const tx = await program.methods
      .createVestingAccount("company_name")
      .accounts({
        signer: employer.publicKey,
        mint: mint,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc({ commitment: "confirmed" });

    console.log(tx);
  });

  it("should fund treasury token account", async () => {
    const amount = 10_000 * 10 ** 9;

    const mintTx = await mintTo(
      banksClient,
      employer,
      mint,
      treasuryTokenAccountKey,
      employer.publicKey,
      amount
    );

    console.log(mintTx);
  });

  it("Initialize Employee Vesting Account", async () => {
    const tx2 = await program.methods
      .createEmployeeAccount(
        new BN(0),
        new BN(10000000000),
        new BN(10000000000),
        new BN(10000)
      )
      .accounts({
        beneficiary: beneficiary.publicKey,
        vestingAccount: vestingAccountKey,
      })
      .rpc({ commitment: "confirmed", skipPreflight: true });

    console.log(tx2);
  });

  it("Claim tokens", async () => {
    await new Promise((resolve) => setTimeout(resolve, 10000));

    const currentClock = await banksClient.getClock();
    context.setClock(
      new Clock(
        currentClock.slot,
        currentClock.epochStartTimeStamp,
        currentClock.epoch,
        currentClock.leaderScheduleEpoch,
        1000
      )
    );

    const tx3 = await program2.methods
      .claimTokens("company_name")
      .accounts({
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc({ commitment: "confirmed" });

    console.log(tx3);
  });
});
