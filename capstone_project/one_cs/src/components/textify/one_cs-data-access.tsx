"use client";

import { getOneCsProgram, getOneCsProgramId } from "@project/anchor";
import { useConnection } from "@solana/wallet-adapter-react";
import { Cluster, Keypair, PublicKey } from "@solana/web3.js";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import toast from "react-hot-toast";
import { useCluster } from "../cluster/cluster-data-access";
import { useAnchorProvider } from "../solana/solana-provider";
import { useTransactionToast } from "../ui/ui-layout";
import { BN } from "@coral-xyz/anchor";
import { web3 } from "@coral-xyz/anchor";

interface EncapsulateTextArgs {
  label: string;
  data: string;
  creator: PublicKey;
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

  const encapsulateText = useMutation<string, Error, EncapsulateTextArgs>({
    mutationKey: ["one_cs", "encapsulateText", { cluster }],
    mutationFn: async ({ label, data, creator }) => {
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
        .encapsulateText(label, data)
        .accounts({
          // @ts-ignore
          encapsulatedData: encapsulatedDataPda,
          permissionedWallet: permissionedWalletPda,
        })
        .rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature);
      return accounts.refetch();
    },
    onError: (error) => {
      console.error("Error:", error);
      toast.error("Failed to encapsulate text");
    },
  });

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    encapsulateText,
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

  // const closeMutation = useMutation({
  //   mutationKey: ["one_cs", "close", { cluster, account }],
  //   mutationFn: () =>
  //     program.methods.close().accounts({ one_cs: account }).rpc(),
  //   onSuccess: (tx) => {
  //     transactionToast(tx);
  //     return accounts.refetch();
  //   },
  // });

  // const decrementMutation = useMutation({
  //   mutationKey: ["one_cs", "decrement", { cluster, account }],
  //   mutationFn: () =>
  //     program.methods.decrement().accounts({ one_cs: account }).rpc(),
  //   onSuccess: (tx) => {
  //     transactionToast(tx);
  //     return accountQuery.refetch();
  //   },
  // });

  return {
    accountQuery,
    addPermission,
    // closeMutation,
    // decrementMutation,
  };
}
