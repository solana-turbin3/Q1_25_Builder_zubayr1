"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletButton } from "../solana/solana-provider";
import { AppHero, ellipsify } from "../ui/ui-layout";
import { ExplorerLink } from "../cluster/cluster-ui";
import { useOneCsProgram } from "./one_cs-data-access";
import { OneCsCreate, OneCsList } from "./one_cs-ui";
import React from "react";

export default function OneCsFeature() {
  const { publicKey } = useWallet();
  const { programId } = useOneCsProgram();

  return publicKey ? (
    <div>
      <AppHero
        title="Heritage"
        subtitle={
          "Heritage is a 1CS protocol that allows users to create time-locked token inheritances on Solana."
        }
      >
        <p className="mb-6">
          <ExplorerLink
            path={`account/${programId}`}
            label={ellipsify(programId.toString())}
          />
        </p>
        <OneCsCreate />
      </AppHero>
      <OneCsList />
    </div>
  ) : (
    <div className="max-w-4xl mx-auto">
      <div className="hero py-[64px]">
        <div className="hero-content text-center">
          <WalletButton />
        </div>
      </div>
    </div>
  );
}
