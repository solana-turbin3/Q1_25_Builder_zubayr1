"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import toast from "react-hot-toast";

import { getOneCsProgram, getOneCsProgramId } from "@project/anchor";
import { useConnection } from "@solana/wallet-adapter-react";
import { Cluster, PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

import { useCluster } from "../cluster/cluster-data-access";
import { useAnchorProvider } from "../solana/solana-provider";
import { useTransactionToast } from "../ui/ui-layout";

interface InitEscrowArgs {
  label: string;
  creator: PublicKey;
  tokenMint: PublicKey;
}

interface DepositToEscrowArgs {
  label: string;
  creator: PublicKey;
  tokenMint: PublicKey;
  amount: BN;
}

interface EncapsulateTokenArgs {
  label: string;
  creator: PublicKey;
  tokenMint: PublicKey;
}

interface AddPermissionArgs {
  label: string;
  roleIndex: number;
  startTime: number;
  endTime: number;
  payer: PublicKey;
  creator: PublicKey;
  permittedWallet: PublicKey;
}

interface TransferOwnershipArgs {
  label: string;
  creator: PublicKey;
  newOwner: PublicKey;
  ownershipTime: number;
}

interface AcceptOwnershipArgs {
  label: string;
  creator: PublicKey;
}

interface EditTokenDataArgs {
  label: string;
  creator: PublicKey;
  taker: PublicKey;
  owner: PublicKey;
  tokenMint: PublicKey;
  amount: BN;
  isDeposit: boolean;
}

export function useOneCsProgram() {
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();

  const programId = useMemo(
    () => getOneCsProgramId(cluster.network as Cluster),
    [cluster]
  );

  const program = useMemo(
    () => getOneCsProgram(provider, programId),
    [provider, programId]
  );

  const accounts = useQuery({
    queryKey: ["one_cs", "all", { cluster }],
    queryFn: () => program.account.permissionData.all(),
  });

  const getProgramAccount = useQuery({
    queryKey: ["get-program-account", { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });

  const initEscrow = useMutation({
    mutationKey: ["one_cs", "initEscrow", { cluster }],
    mutationFn: async ({ label, creator, tokenMint }: InitEscrowArgs) => {
      const [escrowPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("escrow"), creator.toBuffer(), Buffer.from(label)],
        programId
      );

      return program.methods
        .initEscrow(label)
        .accounts({
          creator: creator,
          // @ts-ignore
          escrow: escrowPda,
          tokenMint: tokenMint,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature);
      return accounts.refetch();
    },
    onError: (error) => {
      console.error("Error:", error);
      toast.error("Failed to initialize escrow");
    },
  });

  const depositTokens = useMutation({
    mutationKey: ["one_cs", "depositTokens", { cluster }],
    mutationFn: async ({
      label,
      creator,
      tokenMint,
      amount,
    }: DepositToEscrowArgs) => {
      const [escrowPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("escrow"), creator.toBuffer(), Buffer.from(label)],
        programId
      );

      return program.methods
        .depositTokens(label, amount)
        .accounts({
          creator,
          tokenMint,
          // @ts-ignore
          escrow: escrowPda,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature);
      return accounts.refetch();
    },
  });

  const encapsulateToken = useMutation({
    mutationKey: ["one_cs", "encapsulateToken", { cluster }],
    mutationFn: async ({ label, creator, tokenMint }: EncapsulateTokenArgs) => {
      const [escrowPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("escrow"), creator.toBuffer(), Buffer.from(label)],
        programId
      );

      const [encapsulatedDataPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("permissions"), creator.toBuffer(), Buffer.from(label)],
        programId
      );

      const [permissionedWalletPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("permissioned_wallet"),
          creator.toBuffer(),
          Buffer.from(label),
        ],
        programId
      );

      return program.methods
        .encapsulateToken(label)
        .accounts({
          // @ts-ignore
          escrow: escrowPda,
          tokenMint: tokenMint,
          encapsulatedData: encapsulatedDataPda,
          creator: creator,
          permissionedWallet: permissionedWalletPda,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature);
      return accounts.refetch();
    },
  });

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    initEscrow,
    depositTokens,
    encapsulateToken,
  };
}

export function useOneCsProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const { program, accounts, programId } = useOneCsProgram();

  const accountQuery = useQuery({
    queryKey: ["one_cs", "fetch", { cluster, account }],
    queryFn: () => program.account.permissionData.fetch(account),
  });

  const addPermission = useMutation<string, Error, AddPermissionArgs>({
    mutationKey: ["one_cs", "addPermission", { cluster, account }],
    mutationFn: async ({
      label,
      roleIndex,
      startTime,
      endTime,
      payer,
      creator,
      permittedWallet,
    }) => {
      const [encapsulatedDataPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("permissions"), creator.toBuffer(), Buffer.from(label)],
        programId
      );

      const [permissionedWalletPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("permissioned_wallet"),
          permittedWallet.toBuffer(),
          Buffer.from(label),
        ],
        programId
      );

      const payerPermissionedWalletPda = PublicKey.findProgramAddressSync(
        [
          Buffer.from("permissioned_wallet"),
          payer.toBuffer(),
          Buffer.from(label),
        ],
        programId
      );

      return program.methods
        .addPermission(
          label,
          new BN(roleIndex),
          new BN(startTime),
          new BN(endTime)
        )
        .accounts({
          permittedWallet,
          // @ts-ignore
          encapsulatedData: encapsulatedDataPda,
          permissionedWallet: permissionedWalletPda,
          payerPermissionedWallet: payerPermissionedWalletPda,
        })
        .rpc();
    },
    onSuccess: (tx) => {
      transactionToast(tx);
      return accounts.refetch();
    },
  });

  const transferOwnership = useMutation<string, Error, TransferOwnershipArgs>({
    mutationKey: ["one_cs", "transferOwnership", { cluster, account }],
    mutationFn: async ({ label, creator, newOwner, ownershipTime }) => {
      const [encapsulatedDataPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("permissions"), creator.toBuffer(), Buffer.from(label)],
        programId
      );

      const [newOwnerPermissionedWalletPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("permissioned_wallet"),
          newOwner.toBuffer(),
          Buffer.from(label),
        ],
        programId
      );

      const [delegatedOwnerPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("delegated_owner"),
          creator.toBuffer(),
          Buffer.from(label),
        ],
        programId
      );

      return program.methods
        .transferOwnership(label, new BN(ownershipTime))
        .accounts({
          creator,
          newOwner,
          // @ts-ignore
          encapsulatedData: encapsulatedDataPda,
          newOwnerPermissionedWallet: newOwnerPermissionedWalletPda,
          delegatedOwner: delegatedOwnerPda,
        })
        .rpc();
    },
    onSuccess: (tx) => {
      transactionToast(tx);
      return accounts.refetch();
    },
  });

  const acceptOwnership = useMutation<string, Error, AcceptOwnershipArgs>({
    mutationKey: ["one_cs", "acceptOwnership", { cluster, account }],
    mutationFn: async ({ label, creator }) => {
      const [encapsulatedDataPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("permissions"), creator.toBuffer(), Buffer.from(label)],
        programId
      );

      const [delegatedOwnerPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("delegated_owner"),
          creator.toBuffer(),
          Buffer.from(label),
        ],
        programId
      );

      return program.methods
        .acceptOwnership(label)
        .accounts({
          creator,
          // @ts-ignore
          encapsulatedData: encapsulatedDataPda,
          delegatedOwner: delegatedOwnerPda,
        })
        .rpc();
    },
    onSuccess: (tx) => {
      transactionToast(tx);
      return accounts.refetch();
    },
  });

  const editTokenData = useMutation<string, Error, EditTokenDataArgs>({
    mutationKey: ["one_cs", "editTokenData", { cluster, account }],
    mutationFn: async ({
      label,
      creator,
      taker,
      owner,
      tokenMint,
      amount,
      isDeposit,
    }) => {
      const [escrowPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("escrow"), creator.toBuffer(), Buffer.from(label)],
        programId
      );

      // const [payerPermissionedWalletPda] = PublicKey.findProgramAddressSync(
      //   [
      //     Buffer.from("permissioned_wallet"),
      //     payer.toBuffer(),
      //     Buffer.from(label),
      //   ],
      //   programId
      // );

      const [encapsulatedDataPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("permissions"), creator.toBuffer(), Buffer.from(label)],
        programId
      );

      return program.methods
        .editTokenData(label, amount, isDeposit)
        .accounts({
          creator,
          taker,
          owner,
          // @ts-ignore
          tokenMint,
          // @ts-ignore
          escrow: escrowPda,
          encapsulatedData: encapsulatedDataPda,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();
    },
    onSuccess: (tx) => {
      transactionToast(tx);
      return accounts.refetch();
    },
  });

  return {
    accountQuery,
    addPermission,
    transferOwnership,
    acceptOwnership,
    editTokenData,
  };
}
