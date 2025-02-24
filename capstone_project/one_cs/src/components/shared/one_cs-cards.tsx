"use client";

import { PublicKey } from "@solana/web3.js";
import { ellipsify } from "../ui/ui-layout";
import { ExplorerLink } from "../cluster/cluster-ui";
import { BN } from "@coral-xyz/anchor";

interface EncapsulatedData {
  label: string;
  creator: PublicKey;
  data: {
    text: string | null;
    token: { tokenMint: PublicKey; tokenAmount: BN } | null;
  };
}

export function TextCard({ data }: { data: EncapsulatedData }) {
  if (!data.data.text) return null;

  return (
    <div className="card bg-base-200">
      <div className="card-body">
        <div className="flex justify-between items-center">
          <h3 className="card-title">{data.label}</h3>
          <div className="badge badge-primary">Text</div>
        </div>
        <p className="whitespace-pre-wrap">{data.data.text}</p>
        <div className="card-actions justify-end">
          <ExplorerLink
            path={`account/${data.creator}`}
            label={ellipsify(data.creator.toString())}
          />
        </div>
      </div>
    </div>
  );
}

export function TokenCard({ data }: { data: EncapsulatedData }) {
  if (!data.data.token) return null;

  return (
    <div className="card bg-base-200">
      <div className="card-body">
        <div className="flex justify-between items-center">
          <h3 className="card-title">{data.label}</h3>
          <div className="badge badge-secondary">Token</div>
        </div>
        <div className="space-y-2">
          <p>Amount: {data.data.token.tokenAmount.toString()}</p>
          <p className="font-mono text-sm">
            Mint: {ellipsify(data.data.token.tokenMint.toString())}
          </p>
        </div>
        <div className="card-actions justify-end">
          <ExplorerLink
            path={`account/${data.creator}`}
            label={ellipsify(data.creator.toString())}
          />
        </div>
      </div>
    </div>
  );
}

export function filterTextData(data: EncapsulatedData[]) {
  return data.filter((item) => item.data.text !== null);
}

export function filterTokenData(data: EncapsulatedData[]) {
  return data.filter((item) => item.data.token !== null);
}
