"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletButton } from "../solana/solana-provider";
import { AppHero, ellipsify } from "../ui/ui-layout";
import { ExplorerLink } from "../cluster/cluster-ui";
import { useOneCsProgram } from "./one_cs-data-access";
import { OneCsCreate } from "./one_cs-ui";
import { OneCsList } from "./oneCsList";

export default function OneCsFeature() {
  const { publicKey } = useWallet();
  const { programId } = useOneCsProgram();

  return publicKey ? (
    <div>
      <AppHero
        title="Textify"
        subtitle={
          "Textify is a 1CS protocol that allows users to encapsulate text data and share it with others."
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
