"use client";

import { useState, useEffect } from "react";

import { PublicKey } from "@solana/web3.js";
import { useConnection } from "@solana/wallet-adapter-react";
import { BN } from "@coral-xyz/anchor";

import { useOneCsProgramAccount } from "./one_cs-data-access";
import { ellipsify } from "../ui/ui-layout";
import { ExplorerLink } from "../cluster/cluster-ui";
import { useAddPermission } from "./add-permission-modal";
import { useTransferOwnership } from "./transfer-ownership-modal";
import { useAcceptOwnership } from "./accept-ownership-modal";
import { useEditData } from "./edit-data-modal";
import { AddPermissionModal } from "./add-permission-modal";
import { TransferOwnershipModal } from "./transfer-ownership-modal";
import { AcceptOwnershipModal } from "./accept-ownership-modal";
import { EditDataModal } from "./edit-data-modal";

interface PermissionData {
  label: string;
  creator: PublicKey;
  owner: PublicKey;
  data: {
    text: string | null;
    token: { tokenMint: PublicKey; tokenAmount: BN } | null;
  };
}

export function OneCsCard({ account }: { account: PublicKey }) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const {
    accountQuery,
    addPermission,
    transferOwnership,
    acceptOwnership,
    editTokenData,
  } = useOneCsProgramAccount({ account });
  const { connection } = useConnection();
  const data = accountQuery.data as PermissionData;
  const [decimals, setDecimals] = useState(9); // default to 9

  const { handleAddPermission, isAddPending } = useAddPermission({
    account,
    data,
    onSuccess: () => setIsAddModalOpen(false),
  });

  const { handleTransferOwnership, isTransferPending } = useTransferOwnership({
    account,
    data,
    onSuccess: () => setIsTransferModalOpen(false),
  });

  const { handleAcceptOwnership, isAcceptPending } = useAcceptOwnership({
    account,
    data,
    onSuccess: () => setIsAcceptModalOpen(false),
  });

  const { handleEditData, isEditPending } = useEditData({
    account,
    data,
    onSuccess: () => setIsEditModalOpen(false),
  });

  useEffect(() => {
    if (data?.data.token) {
      connection
        .getParsedAccountInfo(data.data.token.tokenMint)
        .then((info) => {
          const decimals = (info.value?.data as any).parsed.info.decimals;
          setDecimals(decimals);
        })
        .catch(console.error);
    }
  }, [data, connection]);

  const formatAmount = (amount: BN) => {
    return (amount.toNumber() / Math.pow(10, decimals)).toString();
  };

  return accountQuery.isLoading ? (
    <span className="loading loading-spinner loading-lg"></span>
  ) : (
    <div className="card card-bordered border-4 border-secondary bg-secondary/10">
      <div className="card-body">
        <div className="space-y-4">
          {/* Header with Type Badge */}
          <div className="flex justify-between items-center">
            <h2 className="card-title text-lg">{data?.label || "N/A"}</h2>
            <div className="badge badge-secondary">Token</div>
          </div>

          {/* Content */}
          <div className="text-left space-y-2">
            <div className="bg-base-200 p-3 rounded-lg min-h-[60px]">
              {data?.data.token ? (
                <>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Token Mint:</span>
                    <span>
                      {ellipsify(data.data.token.tokenMint.toString())}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-medium">Amount:</span>
                    <span>{formatAmount(data.data.token.tokenAmount)}</span>
                  </div>
                </>
              ) : (
                "No content"
              )}
            </div>
            <div className="flex flex-col gap-1 text-sm opacity-70">
              <div className="flex justify-between">
                <span>Owner</span>
                <span>{ellipsify(data?.owner.toString() || "")}</span>
              </div>
              <div className="flex justify-between">
                <span>Creator</span>
                <span>{ellipsify(data?.creator.toString() || "")}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="card-actions justify-between items-center mt-4">
            <ExplorerLink
              path={`account/${account.toString()}`}
              label={ellipsify(account.toString())}
              className="text-sm opacity-50 hover:opacity-100"
            />
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="btn btn-sm btn-secondary">
                Actions
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M7.247 11.14L2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z" />
                </svg>
              </label>
              <ul
                tabIndex={0}
                className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
              >
                <li>
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    disabled={isAddPending}
                  >
                    {isAddPending ? (
                      <span className="loading loading-spinner loading-sm"></span>
                    ) : (
                      "Add Permission"
                    )}
                  </button>
                </li>
                <li>
                  <button onClick={() => {}}>Remove Permission</button>
                </li>
                <li>
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    disabled={isEditPending}
                  >
                    {isEditPending ? (
                      <span className="loading loading-spinner loading-sm"></span>
                    ) : (
                      "Edit Data"
                    )}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setIsTransferModalOpen(true)}
                    disabled={isTransferPending}
                  >
                    {isTransferPending ? (
                      <span className="loading loading-spinner loading-sm"></span>
                    ) : (
                      "Transfer Ownership"
                    )}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setIsAcceptModalOpen(true)}
                    disabled={isAcceptPending}
                  >
                    {isAcceptPending ? (
                      <span className="loading loading-spinner loading-sm"></span>
                    ) : (
                      "Accept Ownership"
                    )}
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <AddPermissionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddPermission}
      />

      <TransferOwnershipModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        onSubmit={handleTransferOwnership}
      />

      <AcceptOwnershipModal
        isOpen={isAcceptModalOpen}
        onClose={() => setIsAcceptModalOpen(false)}
        onSubmit={handleAcceptOwnership}
        label={data?.label || ""}
        currentOwner={data?.owner.toString() || ""}
      />

      <EditDataModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditData}
        tokenAmount={data?.data.token?.tokenAmount || new BN(0)}
        tokenMint={data?.data.token?.tokenMint || PublicKey.default}
      />
    </div>
  );
}
