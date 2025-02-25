"use client";

import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";

import { useOneCsProgram } from "./one_cs-data-access";
import { OneCsCard } from "./oneCSCard";
import {
  SearchEncapsulatedData,
  SearchPermissionedData,
} from "./search_results";

interface PermissionData {
  label: string;
  creator: PublicKey;
  owner: PublicKey;
  data: {
    text: string | null;
    token: { tokenMint: PublicKey; tokenAmount: BN } | null;
  };
}

export function OneCsList() {
  const { accounts, getProgramAccount } = useOneCsProgram();

  if (getProgramAccount.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>;
  }
  if (!getProgramAccount.data?.value) {
    return (
      <div className="alert alert-info flex justify-center">
        <span>
          Program account not found. Make sure you have deployed the program and
          are on the correct cluster.
        </span>
      </div>
    );
  }

  // Filter for only text encapsulations
  const textAccounts = accounts.data?.filter((account) => {
    const data = account.account as PermissionData;
    return data?.data.text !== null; // Only show accounts with text data
  });

  return (
    <div className={"space-y-6"}>
      <div>
        <p className="text-xl font-semibold mb-4">Search By Creator</p>
        <SearchEncapsulatedData />
      </div>

      <div>
        <p className="text-xl font-semibold mb-4">Search By Permitted Wallet</p>
        <SearchPermissionedData />
      </div>

      <div>
        <p className="text-xl font-semibold mb-4">All Encapsulated Texts</p>
        {accounts.isLoading ? (
          <span className="loading loading-spinner loading-lg"></span>
        ) : textAccounts?.length ? (
          <div className="grid md:grid-cols-2 gap-4">
            {textAccounts.map((account) => (
              <OneCsCard
                key={account.publicKey.toString()}
                account={account.publicKey}
              />
            ))}
          </div>
        ) : (
          <div className="text-center">
            <h2 className={"text-2xl"}>No text encapsulations</h2>
            No text encapsulations found. Create one above to get started.
          </div>
        )}
      </div>
    </div>
  );
}
