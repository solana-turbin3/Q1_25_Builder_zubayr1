"use client";

import { Keypair, PublicKey } from "@solana/web3.js";
import { useMemo, useState } from "react";
import { ellipsify } from "../ui/ui-layout";
import { ExplorerLink } from "../cluster/cluster-ui";
import { useOneCsProgram, useOneCsProgramAccount } from "./one_cs-data-access";
import { useWallet } from "@solana/wallet-adapter-react";
import toast from "react-hot-toast";

export function OneCsCreate() {
  const { encapsulateText } = useOneCsProgram();
  const { publicKey } = useWallet();

  const [label, setLabel] = useState("");
  const [text, setText] = useState("");

  const handleSubmit = () => {
    if (!label || !text) {
      toast.error("Please fill in all fields");
      return;
    }
    if (publicKey) {
      console.log(label, text);
      encapsulateText.mutateAsync({
        label: label,
        data: text,
        creator: publicKey,
      });
    } else {
      toast.error("Please connect your wallet");
    }
  };

  if (!publicKey) {
    return (
      <div className="flex flex-col gap-4">
        <div className="alert alert-info">Please connect your wallet</div>
      </div>
    );
  }

  if (encapsulateText.isPending) {
    return (
      <div className="flex flex-col gap-4">
        <div className="alert alert-info">
          Please wait for the transaction to complete
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="form-control">
        <label className="label">
          <span className="label-text">Add Label</span>
        </label>
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Encapsulate Text</span>
        </label>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>

      <button
        className="btn btn-xs lg:btn-md btn-primary"
        onClick={handleSubmit}
        disabled={encapsulateText.isPending}
      >
        Create {encapsulateText.isPending && "..."}
      </button>
    </div>
  );
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
  return (
    <div className={"space-y-6"}>
      {accounts.isLoading ? (
        <span className="loading loading-spinner loading-lg"></span>
      ) : accounts.data?.length ? (
        <div className="grid md:grid-cols-2 gap-4">
          {accounts.data?.map((account) => (
            <OneCsCard
              key={account.publicKey.toString()}
              account={account.publicKey}
            />
          ))}
        </div>
      ) : (
        <div className="text-center">
          <h2 className={"text-2xl"}>No accounts</h2>
          No accounts found. Create one above to get started.
        </div>
      )}
    </div>
  );
}

function OneCsCard({ account }: { account: PublicKey }) {
  const { accountQuery } = useOneCsProgramAccount({
    account,
  });

  const count = useMemo(
    () => accountQuery.data?.data.text ?? 0,
    [accountQuery.data?.data.text]
  );

  return accountQuery.isLoading ? (
    <span className="loading loading-spinner loading-lg"></span>
  ) : (
    <div className="card card-bordered border-base-300 border-4 text-neutral-content">
      <div className="card-body items-center text-center">
        <div className="space-y-6">
          <h2
            className="card-title justify-center text-3xl cursor-pointer"
            onClick={() => accountQuery.refetch()}
          >
            {count}
          </h2>
          <div className="card-actions justify-around">
            <button
              className="btn btn-xs lg:btn-md btn-outline"
              onClick={() => accountQuery.refetch()}
              disabled={accountQuery.isPending}
            >
              Increment
            </button>
            <button
              className="btn btn-xs lg:btn-md btn-outline"
              onClick={() => {
                const value = window.prompt(
                  "Set value to:",
                  count.toString() ?? "0"
                );
                if (
                  !value ||
                  parseInt(value) === count ||
                  isNaN(parseInt(value))
                ) {
                  return;
                }
                return 0;
              }}
              disabled={accountQuery.isPending}
            >
              Set
            </button>
            <button
              className="btn btn-xs lg:btn-md btn-outline"
              onClick={() => accountQuery.refetch()}
              disabled={accountQuery.isPending}
            >
              Decrement
            </button>
          </div>
          <div className="text-center space-y-4">
            <p>
              <ExplorerLink
                path={`account/${account.toString()}`}
                label={ellipsify(account.toString())}
              />
            </p>
            <button
              className="btn btn-xs btn-secondary btn-outline"
              onClick={() => {
                if (
                  !window.confirm(
                    "Are you sure you want to close this account?"
                  )
                ) {
                  return;
                }
                return accountQuery.refetch();
              }}
              disabled={accountQuery.isPending}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
