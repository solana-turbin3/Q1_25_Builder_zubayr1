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

interface Permission {
  label: string;
  roleIndex: number;
  startTime: number;
  endTime: number;
}

interface EncapsulateTextArgs {
  label: string;
  data: string;
  creator: PublicKey;
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

  // const initialize = useMutation({
  //   mutationKey: ["one_cs", "initialize", { cluster }],
  //   mutationFn: (keypair: Keypair) =>
  //     program.methods
  //       .initialize()
  //       .accounts({ one_cs: keypair.publicKey })
  //       .signers([keypair])
  //       .rpc(),
  //   onSuccess: (signature) => {
  //     transactionToast(signature);
  //     return accounts.refetch();
  //   },
  //   onError: () => toast.error("Failed to initialize account"),
  // });

  const encapsulateText = useMutation<string, Error, EncapsulateTextArgs>({
    mutationKey: ["oneCs", "encapsulateText", { cluster }],
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

      console.log(encapsulatedDataPda, permissionedWalletPda);

      return program.methods
        .encapsulateText(label, data)
        .accounts({
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
    // initialize,
    encapsulateText,
  };
}

export function useOneCsProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const { program, accounts } = useOneCsProgram();

  const accountQuery = useQuery({
    queryKey: ["one_cs", "fetch", { cluster, account }],
    queryFn: () => program.account.permissionData.fetch(account),
  });

  const addPermission = useMutation({
    mutationKey: ["one_cs", "addPermission", { cluster, account }],
    mutationFn: (permission: Permission) =>
      program.methods
        .addPermission(
          permission.label,
          new BN(permission.roleIndex),
          new BN(permission.startTime),
          new BN(permission.endTime)
        )
        .rpc(),
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
