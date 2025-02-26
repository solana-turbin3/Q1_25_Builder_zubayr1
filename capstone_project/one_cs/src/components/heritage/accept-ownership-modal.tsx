import toast from "react-hot-toast";

import { PublicKey } from "@solana/web3.js";

import { ellipsify } from "../ui/ui-layout";
import { useOneCsProgramAccount } from "./one_cs-data-access";

interface UseAcceptOwnershipProps {
  account: PublicKey;
  data: {
    label: string;
    creator: PublicKey;
  };
  onSuccess: () => void;
}

export function useAcceptOwnership({
  account,
  data,
  onSuccess,
}: UseAcceptOwnershipProps) {
  const { acceptOwnership } = useOneCsProgramAccount({ account });

  const handleAcceptOwnership = () => {
    try {
      acceptOwnership.mutateAsync({
        label: data?.label || "",
        creator: data?.creator,
      });
      onSuccess();
    } catch (err) {
      toast.error("Error accepting ownership: " + err);
    }
  };

  return {
    handleAcceptOwnership,
    isAcceptPending: acceptOwnership.isPending,
  };
}

interface AcceptOwnershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  label: string;
  currentOwner: string;
}

export function AcceptOwnershipModal({
  isOpen,
  onClose,
  onSubmit,
  label,
  currentOwner,
}: AcceptOwnershipModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Accept Ownership</h3>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <p>
              <span className="font-medium">Label:</span> {label}
            </p>
            <p>
              <span className="font-medium">Current Owner:</span>{" "}
              {ellipsify(currentOwner)}
            </p>
          </div>
          <p className="text-sm opacity-70">
            Are you sure you want to accept ownership of this token
            encapsulation?
          </p>
        </div>
        <div className="modal-action">
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={onSubmit}>
            Accept Ownership
          </button>
        </div>
      </div>
    </div>
  );
}
