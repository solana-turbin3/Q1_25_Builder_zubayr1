import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Keypair, PublicKey } from "@solana/web3.js";
import { BankrunProvider } from "anchor-bankrun";
import { startAnchor, BanksClient, Clock } from "solana-bankrun";
import {
  createAssociatedTokenAccount,
  createMint,
  mintTo,
  getAccount,
} from "spl-token-bankrun";

import { OneCs } from "../target/types/one_cs";
import { SYSTEM_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/native/system";
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";

const IDL = require("../target/idl/one_cs.json");

describe("one_cs", () => {
  const label = "test";
  const tokenlabel = "token";
  const data = "data to be encapsulated";
  const new_data = "new data to be encapsulated";

  let context: any;
  let provider: any;
  let program: any;
  let payer: Keypair;

  let encapsulatePDA: PublicKey;
  let escrowPDA: PublicKey;
  let encapsulateTokenPDA: PublicKey;

  let vaultAta: PublicKey;
  let payerAta: PublicKey;
  let ownerAta: PublicKey;
  let takerAta: PublicKey;

  let newKeypair: Keypair;
  let newPublicKey: PublicKey;
  let newKeypair2: Keypair;
  let newPublicKey2: PublicKey;
  let newKeypair3: Keypair;
  let newPublicKey3: PublicKey;

  let tokenMint: PublicKey;

  let banksClient: BanksClient;

  const amount = 10_000 * 10 ** 9;

  const depositAmount = 10_000 * 10 ** 9;

  beforeAll(async () => {
    newKeypair = new anchor.web3.Keypair();
    newPublicKey = newKeypair.publicKey;

    newKeypair2 = new anchor.web3.Keypair();
    newPublicKey2 = newKeypair2.publicKey;

    newKeypair3 = new anchor.web3.Keypair();
    newPublicKey3 = newKeypair3.publicKey;

    context = await startAnchor(
      "",
      [{ name: "one_cs", programId: new PublicKey(IDL.address) }],
      [
        {
          address: newKeypair.publicKey,
          info: {
            lamports: 100000000000,
            executable: false,
            owner: SYSTEM_PROGRAM_ID,
            data: Buffer.alloc(0),
          },
        },
        {
          address: newKeypair2.publicKey,
          info: {
            lamports: 100000000000,
            executable: false,
            owner: SYSTEM_PROGRAM_ID,
            data: Buffer.alloc(0),
          },
        },
        {
          address: newKeypair3.publicKey,
          info: {
            lamports: 100000000000,
            executable: false,
            owner: SYSTEM_PROGRAM_ID,
            data: Buffer.alloc(0),
          },
        },
      ]
    );

    provider = new BankrunProvider(context);
    anchor.setProvider(provider);
    program = new Program<OneCs>(IDL, provider);
    payer = provider.wallet.payer;

    banksClient = context.banksClient;

    // @ts-ignore
    tokenMint = await createMint(banksClient, payer, payer.publicKey, null, 2);

    ownerAta = await createAssociatedTokenAccount(
      // @ts-ignore
      banksClient,
      payer,
      tokenMint,
      payer.publicKey
    );

    payerAta = await createAssociatedTokenAccount(
      // @ts-ignore
      banksClient,
      payer,
      tokenMint,
      newKeypair.publicKey
    );

    takerAta = await createAssociatedTokenAccount(
      // @ts-ignore
      banksClient,
      payer,
      tokenMint,
      newKeypair2.publicKey
    );

    [encapsulatePDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("permissions"),
        program.programId.toBuffer(),
        Buffer.from(label),
      ],
      program.programId
    );

    [escrowPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("escrow"),
        program.programId.toBuffer(),
        Buffer.from(tokenlabel),
      ],
      program.programId
    );

    [encapsulateTokenPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("permissions"),
        program.programId.toBuffer(),
        Buffer.from(tokenlabel),
      ],
      program.programId
    );

    vaultAta = await anchor.utils.token.associatedAddress({
      mint: tokenMint,
      owner: escrowPDA,
    });

    await mintTo(
      // @ts-ignore
      banksClient,
      payer,
      tokenMint,
      ownerAta,
      payer.publicKey,
      amount
    );

    await mintTo(
      // @ts-ignore
      banksClient,
      payer,
      tokenMint,
      payerAta,
      payer.publicKey,
      amount
    );
  });

  it("encapsulate", async () => {
    const dataObject = { text: data, token: null };

    await program.methods
      .encapsulateText(label, data)
      .accounts({
        owner: payer.publicKey,
      })
      .rpc({ commitment: "confirmed" });

    const encapsulatedData = await program.account.permissionData.fetch(
      encapsulatePDA
    );

    expect(encapsulatedData.owner).toEqual(payer.publicKey);
    expect(encapsulatedData.label).toEqual(label);
    expect(encapsulatedData.data).toEqual(dataObject);
    expect(encapsulatedData.permissions.length).toEqual(1);
    expect(encapsulatedData.permissions[0].role).toEqual({ owner: {} });
    expect(encapsulatedData.permissions[0].wallet).toEqual(payer.publicKey);
  });

  it("add permission", async () => {
    await program.methods
      .addPermission(
        label,
        new anchor.BN(2),
        new anchor.BN(0),
        new anchor.BN(0)
      )
      .accounts({
        payer: payer.publicKey,
        permittedWallet: newPublicKey,
      })
      .rpc({ commitment: "confirmed" });

    let encapsulatedData = await program.account.permissionData.fetch(
      encapsulatePDA
    );

    expect(encapsulatedData.permissions.length).toBe(2);

    expect(encapsulatedData.permissions[0].role).toEqual({ owner: {} });
    expect(encapsulatedData.permissions[0].wallet.toString()).toBe(
      payer.publicKey.toString()
    );
    expect(encapsulatedData.permissions[0].startTime.toNumber()).toBe(0);
    expect(encapsulatedData.permissions[0].endTime.toNumber()).toBe(0);

    expect(encapsulatedData.permissions[1].role).toEqual({ admin: {} });
    expect(encapsulatedData.permissions[1].wallet.toString()).toBe(
      newPublicKey.toString()
    );
    expect(encapsulatedData.permissions[1].startTime.toNumber()).toBe(0);
    expect(encapsulatedData.permissions[1].endTime.toNumber()).toBe(0);

    await program.methods
      .addPermission(
        label,
        new anchor.BN(2),
        new anchor.BN(0),
        new anchor.BN(0)
      )
      .accounts({
        payer: newPublicKey,
        permittedWallet: newPublicKey2,
      })
      .signers([newKeypair])
      .rpc({ commitment: "confirmed" });

    encapsulatedData = await program.account.permissionData.fetch(
      encapsulatePDA
    );

    expect(encapsulatedData.permissions.length).toBe(3);
    expect(encapsulatedData.permissions[2].role).toEqual({ admin: {} });
    expect(encapsulatedData.permissions[2].wallet.toString()).toBe(
      newPublicKey2.toString()
    );
    expect(encapsulatedData.permissions[2].startTime.toNumber()).toBe(0);
    expect(encapsulatedData.permissions[2].endTime.toNumber()).toBe(0);

    await program.methods
      .addPermission(
        label,
        new anchor.BN(3),
        new anchor.BN(0),
        new anchor.BN(1000_000_00)
      )
      .accounts({
        payer: payer.publicKey,
        permittedWallet: newPublicKey,
      })
      .rpc({ commitment: "confirmed" });

    encapsulatedData = await program.account.permissionData.fetch(
      encapsulatePDA
    );

    expect(encapsulatedData.permissions[1].role).toEqual({ fullAccess: {} });
    expect(encapsulatedData.permissions[1].wallet.toString()).toBe(
      newPublicKey.toString()
    );
    expect(encapsulatedData.permissions[1].startTime.toNumber()).toBe(0);
    expect(encapsulatedData.permissions[1].endTime.toNumber()).toBe(0);

    await program.methods
      .addPermission(
        label,
        new anchor.BN(4),
        new anchor.BN(1736449654),
        new anchor.BN(1836449654)
      )
      .accounts({
        payer: payer.publicKey,
        permittedWallet: newPublicKey2,
      })
      .rpc({ commitment: "confirmed" });

    encapsulatedData = await program.account.permissionData.fetch(
      encapsulatePDA
    );

    expect(encapsulatedData.permissions[2].role).toEqual({ timeLimited: {} });
    expect(encapsulatedData.permissions[2].wallet.toString()).toBe(
      newPublicKey2.toString()
    );
    expect(encapsulatedData.permissions[2].startTime.toNumber()).toBe(
      1736449654
    );
    expect(encapsulatedData.permissions[2].endTime.toNumber()).toBe(1836449654);
  });

  it("remove permission", async () => {
    await program.methods
      .removePermission(label)
      .accounts({
        payer: payer.publicKey,
        permittedWallet: newPublicKey,
      })
      .rpc({ commitment: "confirmed" });

    let encapsulatedData = await program.account.permissionData.fetch(
      encapsulatePDA
    );

    expect(encapsulatedData.permissions.length).toBe(2);

    expect(encapsulatedData.permissions[0].role).toEqual({ owner: {} });
    expect(encapsulatedData.permissions[0].wallet.toString()).toBe(
      payer.publicKey.toString()
    );
    expect(encapsulatedData.permissions[0].startTime.toNumber()).toBe(0);
    expect(encapsulatedData.permissions[0].endTime.toNumber()).toBe(0);

    expect(encapsulatedData.permissions[1].role).toEqual({ timeLimited: {} });
    expect(encapsulatedData.permissions[1].wallet.toString()).toBe(
      newPublicKey2.toString()
    );
    expect(encapsulatedData.permissions[1].startTime.toNumber()).toBe(
      1736449654
    );
    expect(encapsulatedData.permissions[1].endTime.toNumber()).toBe(1836449654);

    /// add permission again for further testing
    await program.methods
      .addPermission(
        label,
        new anchor.BN(2),
        new anchor.BN(0),
        new anchor.BN(0)
      )
      .accounts({
        payer: payer.publicKey,
        permittedWallet: newPublicKey2,
      })
      .rpc({ commitment: "confirmed" });

    await program.methods
      .addPermission(
        label,
        new anchor.BN(3),
        new anchor.BN(0),
        new anchor.BN(0)
      )
      .accounts({
        payer: newPublicKey2,
        permittedWallet: newPublicKey,
      })
      .signers([newKeypair2])
      .rpc({ commitment: "confirmed" });

    encapsulatedData = await program.account.permissionData.fetch(
      encapsulatePDA
    );

    expect(encapsulatedData.permissions.length).toBe(3);

    expect(encapsulatedData.permissions[0].role).toEqual({ owner: {} });
    expect(encapsulatedData.permissions[0].wallet.toString()).toBe(
      payer.publicKey.toString()
    );
    expect(encapsulatedData.permissions[0].startTime.toNumber()).toBe(0);
    expect(encapsulatedData.permissions[0].endTime.toNumber()).toBe(0);

    expect(encapsulatedData.permissions[1].role).toEqual({ admin: {} });
    expect(encapsulatedData.permissions[1].wallet.toString()).toBe(
      newPublicKey2.toString()
    );
    expect(encapsulatedData.permissions[1].startTime.toNumber()).toBe(0);
    expect(encapsulatedData.permissions[1].endTime.toNumber()).toBe(0);

    expect(encapsulatedData.permissions[2].role).toEqual({ fullAccess: {} });
    expect(encapsulatedData.permissions[2].wallet.toString()).toBe(
      newPublicKey.toString()
    );
    expect(encapsulatedData.permissions[2].startTime.toNumber()).toBe(0);
    expect(encapsulatedData.permissions[2].endTime.toNumber()).toBe(0);

    await program.methods
      .addPermission(
        label,
        new anchor.BN(2),
        new anchor.BN(0),
        new anchor.BN(0)
      )
      .accounts({
        payer: newPublicKey2,
        permittedWallet: newPublicKey,
      })
      .signers([newKeypair2])
      .rpc({ commitment: "confirmed" });

    // will fail here
    // await program.methods
    //   .removePermission(label)
    //   .accounts({
    //     payer: newPublicKey2,
    //     permittedWallet: newPublicKey,
    //   })
    //   .signers([newKeypair2])
    //   .rpc({commitment: "confirmed"})
  });

  it("edit data with different keypair", async () => {
    const newPublicKeyBalanceBefore = await context.banksClient.getBalance(
      newPublicKey
    );
    const payerBalanceBefore = await context.banksClient.getBalance(
      payer.publicKey
    );
    // console.log(`Balance before transaction: ${newPublicKeyBalanceBefore} SOL`);
    // console.log(`Payer balance before transaction: ${payerBalanceBefore} SOL`);

    await program.methods
      .editTextData(label, new_data)
      .accounts({
        payer: newKeypair.publicKey,
      })
      .signers([newKeypair])
      .rpc({ commitment: "confirmed" });

    let encapsulatedData = await program.account.permissionData.fetch(
      encapsulatePDA
    );

    let dataObject = { text: new_data, token: null };

    expect(encapsulatedData.data).toEqual(dataObject);

    const newPublicKeyBalanceAfter = await context.banksClient.getBalance(
      newPublicKey
    );
    const payerBalanceAfter = await context.banksClient.getBalance(
      payer.publicKey
    );
    // console.log(`Balance after transaction: ${newPublicKeyBalanceAfter} SOL`);
    // console.log(`Payer balance after transaction: ${payerBalanceAfter} SOL`);

    // update permission to time limited
    await program.methods
      .addPermission(
        label,
        new anchor.BN(4),
        new anchor.BN(1736449654),
        new anchor.BN(1836449654)
      )
      .accounts({
        payer: payer.publicKey,
        permittedWallet: newPublicKey,
      })
      .rpc({ commitment: "confirmed" });

    await program.methods
      .editTextData(label, data)
      .accounts({
        payer: newKeypair.publicKey,
      })
      .signers([newKeypair])
      .rpc({ commitment: "confirmed" });

    encapsulatedData = await program.account.permissionData.fetch(
      encapsulatePDA
    );

    dataObject = { text: data, token: null };

    expect(encapsulatedData.data).toEqual(dataObject);

    //will fail here
    // await program.methods
    //   .addPermission(label, new anchor.BN(4), new anchor.BN(0), new anchor.BN(0))
    //   .accounts({
    //     payer: payer.publicKey,
    //     permittedWallet: newPublicKey,
    //   })
    //   .rpc({commitment: "confirmed"})

    //   await program.methods
    //   .editTextData(label, data)
    //   .accounts({
    //     payer: newKeypair.publicKey,
    //   })
    //   .signers([newKeypair])
    //   .rpc({commitment: "confirmed"})
  });

  it("transfer ownership", async () => {
    await program.methods
      .transferOwnership(label, newPublicKey, new anchor.BN(0))
      .accounts({
        owner: payer.publicKey,
      })
      .rpc({ commitment: "confirmed" });

    let encapsulatedData = await program.account.permissionData.fetch(
      encapsulatePDA
    );

    expect(encapsulatedData.owner).toEqual(newPublicKey);

    expect(encapsulatedData.permissions[0].role).toEqual({ admin: {} });
    expect(encapsulatedData.permissions[1].role).toEqual({ admin: {} });
    expect(encapsulatedData.permissions[2].role).toEqual({ owner: {} });

    await program.methods
      .transferOwnership(label, newPublicKey3, new anchor.BN(1111))
      .accounts({
        owner: newPublicKey,
      })
      .signers([newKeypair])
      .rpc({ commitment: "confirmed" });

    encapsulatedData = await program.account.permissionData.fetch(
      encapsulatePDA
    );

    expect(encapsulatedData.owner).toEqual(newPublicKey3);
    expect(encapsulatedData.permissions[0].role).toEqual({ admin: {} });
    expect(encapsulatedData.permissions[1].role).toEqual({ admin: {} });
    expect(encapsulatedData.permissions[2].role).toEqual({ admin: {} });
    expect(encapsulatedData.permissions[3].role).toEqual({ owner: {} });
  });

  it("accept ownership", async () => {
    // Ideally would be a future time
    const currentTimePlusSomeSeconds = Math.floor(Date.now() / 1000) + 1;

    await program.methods
      .transferOwnership(
        label,
        newPublicKey,
        new anchor.BN(currentTimePlusSomeSeconds)
      )
      .accounts({
        owner: newPublicKey3,
      })
      .signers([newKeypair3])
      .rpc({ commitment: "confirmed" });

    const currentClock = await banksClient.getClock();
    context.setClock(
      new Clock(
        currentClock.slot,
        currentClock.epochStartTimestamp,
        BigInt(currentClock.epoch),
        BigInt(currentClock.leaderScheduleEpoch),
        BigInt(currentTimePlusSomeSeconds + 2)
      )
    );

    await program.methods
      .acceptOwnership(label)
      .accounts({
        signer: newPublicKey,
      })
      .signers([newKeypair])
      .rpc({ commitment: "confirmed" });

    let encapsulatedData = await program.account.permissionData.fetch(
      encapsulatePDA
    );

    expect(encapsulatedData.owner).toEqual(newPublicKey);
    expect(encapsulatedData.permissions[0].role).toEqual({ admin: {} });
    expect(encapsulatedData.permissions[1].role).toEqual({ admin: {} });
    expect(encapsulatedData.permissions[2].role).toEqual({ owner: {} });
    expect(encapsulatedData.permissions[3].role).toEqual({ admin: {} });

    // reset ownership for next tests
    await program.methods
      .transferOwnership(label, payer.publicKey, new anchor.BN(0))
      .accounts({
        owner: newPublicKey,
      })
      .signers([newKeypair])
      .rpc({ commitment: "confirmed" });

    encapsulatedData = await program.account.permissionData.fetch(
      encapsulatePDA
    );

    expect(encapsulatedData.owner).toEqual(payer.publicKey);
  });

  it("init escrow", async () => {
    await program.methods
      .initEscrow(tokenlabel)
      .accounts({
        owner: payer.publicKey,
        tokenMint: tokenMint,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc({ commitment: "confirmed" });

    const escrow = await program.account.escrow.fetch(escrowPDA);

    expect(escrow.owner).toEqual(payer.publicKey);
    expect(escrow.tokenMint).toEqual(tokenMint);
  });

  it("deposit tokens", async () => {
    await program.methods
      .depositTokens(tokenlabel, new anchor.BN(amount))
      .accounts({
        owner: payer.publicKey,
        tokenMint: tokenMint,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc({ commitment: "confirmed" });

    // @ts-ignore
    const vaultAccount = await getAccount(banksClient, vaultAta);
    expect(vaultAccount.amount).toEqual(BigInt(amount));
  });

  it("encapsulate token", async () => {
    // Get the current vault amount first
    const vaultAta = await anchor.utils.token.associatedAddress({
      mint: tokenMint,
      owner: escrowPDA,
    });

    // @ts-ignore
    const vaultAccount = await getAccount(banksClient, vaultAta);
    const currentAmount = vaultAccount.amount;

    await program.methods
      .encapsulateToken(tokenlabel)
      .accounts({
        owner: payer.publicKey,
        tokenMint: tokenMint,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc({ commitment: "confirmed" });

    const encapsulatedData = await program.account.permissionData.fetch(
      encapsulateTokenPDA
    );

    const receivedAmountStr =
      encapsulatedData.data.token.tokenAmount.toString();

    expect(encapsulatedData.data.token.tokenMint).toEqual(tokenMint);
    expect(receivedAmountStr).toEqual(currentAmount.toString());
    expect(encapsulatedData.owner).toEqual(payer.publicKey);
    expect(encapsulatedData.label).toEqual(tokenlabel);
    expect(encapsulatedData.permissions.length).toEqual(1);
    expect(encapsulatedData.permissions[0].role).toEqual({ owner: {} });
    expect(encapsulatedData.permissions[0].wallet).toEqual(payer.publicKey);
  });

  it("add permission to token", async () => {
    await program.methods
      .addPermission(
        tokenlabel,
        new anchor.BN(2),
        new anchor.BN(0),
        new anchor.BN(0)
      )
      .accounts({
        payer: payer.publicKey,
        permittedWallet: newPublicKey,
      })
      .rpc({ commitment: "confirmed" });

    let encapsulatedData = await program.account.permissionData.fetch(
      encapsulateTokenPDA
    );

    expect(encapsulatedData.permissions.length).toBe(2);

    expect(encapsulatedData.permissions[0].role).toEqual({ owner: {} });
    expect(encapsulatedData.permissions[0].wallet).toEqual(payer.publicKey);

    expect(encapsulatedData.permissions[1].role).toEqual({ admin: {} });
    expect(encapsulatedData.permissions[1].wallet).toEqual(newPublicKey);

    await program.methods
      .addPermission(
        tokenlabel,
        new anchor.BN(4),
        new anchor.BN(1736449654),
        new anchor.BN(1836449654)
      )
      .accounts({
        payer: newPublicKey,
        permittedWallet: newPublicKey2,
      })
      .signers([newKeypair])
      .rpc({ commitment: "confirmed" });

    encapsulatedData = await program.account.permissionData.fetch(
      encapsulateTokenPDA
    );

    expect(encapsulatedData.permissions.length).toBe(3);

    expect(encapsulatedData.permissions[2].role).toEqual({ timeLimited: {} });
    expect(encapsulatedData.permissions[2].wallet).toEqual(newPublicKey2);
    expect(encapsulatedData.permissions[2].startTime.toNumber()).toBe(
      1736449654
    );
    expect(encapsulatedData.permissions[2].endTime.toNumber()).toBe(1836449654);
  });

  it("remove permission from token", async () => {
    await program.methods
      .removePermission(tokenlabel)
      .accounts({
        payer: payer.publicKey,
        permittedWallet: newPublicKey2,
      })
      .rpc({ commitment: "confirmed" });

    let encapsulatedData = await program.account.permissionData.fetch(
      encapsulateTokenPDA
    );

    expect(encapsulatedData.permissions.length).toBe(2);
  });

  it("edit token data: deposit", async () => {
    await program.methods
      .editTokenData(tokenlabel, new anchor.BN(depositAmount), true)
      .accounts({
        payer: newKeypair.publicKey,
        taker: newKeypair2.publicKey,
        owner: payer.publicKey,
        tokenMint: tokenMint,
        vault: vaultAta,
        payerAta: payerAta,
        takerAta: takerAta,
        ownerAta: ownerAta,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([newKeypair])
      .rpc({ commitment: "confirmed" });

    const encapsulatedData = await program.account.permissionData.fetch(
      encapsulateTokenPDA
    );

    const expectedAmount = new anchor.BN(amount).add(
      new anchor.BN(depositAmount)
    );

    expect(encapsulatedData.data.token.tokenAmount.toString()).toEqual(
      expectedAmount.toString()
    );
  });

  it("edit token data: withdraw", async () => {
    await program.methods
      .editTokenData(tokenlabel, new anchor.BN(depositAmount), false)
      .accounts({
        payer: newKeypair.publicKey,
        taker: newKeypair2.publicKey,
        owner: payer.publicKey,
        tokenMint: tokenMint,
        vault: vaultAta,
        payerAta: payerAta,
        takerAta: takerAta,
        ownerAta: ownerAta,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([newKeypair])
      .rpc({ commitment: "confirmed" });

    const encapsulatedData = await program.account.permissionData.fetch(
      encapsulateTokenPDA
    );

    expect(encapsulatedData.data.token.tokenAmount.toString()).toEqual(
      new anchor.BN(amount).toString()
    );

    // @ts-ignore
    const vaultAccount = await getAccount(banksClient, vaultAta);
    expect(vaultAccount.amount).toEqual(BigInt(amount));

    // @ts-ignore
    const takerAtaAccount = await getAccount(banksClient, takerAta);
    expect(takerAtaAccount.amount).toEqual(BigInt(depositAmount));
  });

  it("edit token data: withdraw all", async () => {
    await program.methods
      .editTokenData(tokenlabel, new anchor.BN(amount), false)
      .accounts({
        payer: newKeypair.publicKey,
        taker: newKeypair2.publicKey,
        owner: payer.publicKey,
        tokenMint: tokenMint,
        vault: vaultAta,
        payerAta: payerAta,
        takerAta: takerAta,
        ownerAta: ownerAta,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([newKeypair])
      .rpc({ commitment: "confirmed" });

    const encapsulatedData = await program.account.permissionData.fetch(
      encapsulateTokenPDA
    );

    expect(encapsulatedData.data.token).toEqual(null);
  });
});
