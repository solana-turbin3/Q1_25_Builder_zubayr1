"use client";

import { useState } from "react";
import toast from "react-hot-toast";

import { PublicKey } from "@solana/web3.js";

import { useOneCsProgramAccount } from "./one_cs-data-access";

interface UseTransferOwnershipProps {
  account: PublicKey;
  data: {
    label: string;
    creator: PublicKey;
  };
  onSuccess: () => void;
}

export function useTransferOwnership({
  account,
  data,
  onSuccess,
}: UseTransferOwnershipProps) {
  const { transferOwnership } = useOneCsProgramAccount({ account });

  const handleTransferOwnership = (formData: {
    newOwner: string;
    ownershipTime: number;
  }) => {
    try {
      const newOwnerPubkey = new PublicKey(formData.newOwner);
      transferOwnership.mutateAsync({
        label: data?.label || "",
        creator: data?.creator,
        newOwner: newOwnerPubkey,
        ownershipTime: formData.ownershipTime,
      });
      onSuccess();
    } catch (err) {
      toast.error("Error transferring ownership: " + err);
    }
  };

  return {
    handleTransferOwnership,
    isTransferPending: transferOwnership.isPending,
  };
}

interface TransferOwnershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { newOwner: string; ownershipTime: number }) => void;
}

export function TransferOwnershipModal({
  isOpen,
  onClose,
  onSubmit,
}: TransferOwnershipModalProps) {
  const [newOwner, setNewOwner] = useState("");
  const [ownershipTime, setOwnershipTime] = useState("");
  const [timeError, setTimeError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedTime = new Date(ownershipTime).getTime();
    const minTime = Date.now() + 5 * 60 * 1000; // Current time + 5 minutes

    if (selectedTime < minTime) {
      setTimeError("Ownership time must be at least 5 minutes in the future");
      return;
    }

    onSubmit({
      newOwner,
      ownershipTime: Math.floor(selectedTime / 1000),
    });
  };

  const isFormValid = newOwner.trim() !== "" && ownershipTime !== "";

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Transfer Ownership</h3>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="form-control">
            <label className="label">New Owner</label>
            <input
              type="text"
              className="input input-bordered"
              value={newOwner}
              onChange={(e) => setNewOwner(e.target.value)}
              placeholder="Enter wallet address"
            />
          </div>

          <div className="form-control">
            <label className="label">Ownership Time</label>
            <input
              type="datetime-local"
              className="input input-bordered"
              value={ownershipTime}
              onChange={(e) => {
                setOwnershipTime(e.target.value);
                setTimeError(""); // Clear error when input changes
              }}
            />
            {timeError && (
              <label className="label">
                <span className="label-text-alt text-error">{timeError}</span>
              </label>
            )}
          </div>

          <div className="modal-action">
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!isFormValid}
            >
              Transfer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
