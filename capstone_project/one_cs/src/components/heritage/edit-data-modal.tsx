import toast from "react-hot-toast";

import { BN } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";

import { useOneCsProgramAccount } from "./one_cs-data-access";
import { ellipsify } from "../ui/ui-layout";

interface UseEditDataProps {
  account: PublicKey;
  data: {
    label: string;
    creator: PublicKey;
    owner: PublicKey;
    data: {
      text: string | null;
      token: { tokenMint: PublicKey; tokenAmount: BN } | null;
    };
  };
  onSuccess: () => void;
}

export function useEditData({ account, data, onSuccess }: UseEditDataProps) {
  const { editTokenData } = useOneCsProgramAccount({ account });
  const { publicKey } = useWallet();

  const handleEditData = async () => {
    try {
      if (!data?.data.token || !publicKey) {
        toast.error(
          publicKey ? "No token data found" : "Please connect your wallet"
        );
        return;
      }

      editTokenData.mutateAsync({
        label: data?.label || "",
        creator: data?.creator,
        owner: data?.owner,
        taker: publicKey,
        amount: data.data.token.tokenAmount,
        isDeposit: false,
        tokenMint: data.data.token.tokenMint,
      });
      onSuccess();
    } catch (err) {
      toast.error("Error withdrawing tokens: " + err);
    }
  };

  return {
    handleEditData,
    isEditPending: editTokenData.isPending,
  };
}

interface EditDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  tokenAmount: BN;
  tokenMint: PublicKey;
}

export function EditDataModal({
  isOpen,
  onClose,
  onSubmit,
  tokenAmount,
  tokenMint,
}: EditDataModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Withdraw Token</h3>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <p>
              <span className="font-medium">Token Mint:</span>{" "}
              {ellipsify(tokenMint.toString())}
            </p>
            <p>
              <span className="font-medium">Amount to Withdraw:</span>{" "}
              {tokenAmount.toString()}
            </p>
          </div>
          <p className="text-sm opacity-70">
            This will withdraw all tokens back to your wallet. This action
            cannot be undone.
          </p>
        </div>
        <div className="modal-action">
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={onSubmit}>
            Withdraw
          </button>
        </div>
      </div>
    </div>
  );
}
