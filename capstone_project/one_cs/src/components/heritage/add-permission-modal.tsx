"use client";

import { useState } from "react";
import toast from "react-hot-toast";

import { PublicKey } from "@solana/web3.js";

import { useOneCsProgramAccount } from "./one_cs-data-access";

interface UseAddPermissionProps {
  account: PublicKey;
  data: {
    label: string;
    creator: PublicKey;
  };
  onSuccess: () => void;
}

export function useAddPermission({
  account,
  data,
  onSuccess,
}: UseAddPermissionProps) {
  const { addPermission } = useOneCsProgramAccount({ account });

  const handleAddPermission = (formData: {
    roleIndex: number;
    startTime: number;
    endTime: number;
    permittedWallet: string;
  }) => {
    try {
      const permittedWalletPubkey = new PublicKey(formData.permittedWallet);
      addPermission.mutateAsync({
        label: data?.label || "",
        roleIndex: formData.roleIndex,
        startTime: formData.startTime,
        endTime: formData.endTime,
        payer: account,
        creator: data?.creator,
        permittedWallet: permittedWalletPubkey,
      });
      onSuccess();
    } catch (err) {
      toast.error("Error adding permission: " + err);
    }
  };

  return {
    handleAddPermission,
    isAddPending: addPermission.isPending,
  };
}

interface AddPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    roleIndex: number;
    startTime: number;
    endTime: number;
    permittedWallet: string;
  }) => void;
}

export function AddPermissionModal({
  isOpen,
  onClose,
  onSubmit,
}: AddPermissionModalProps) {
  const [roleIndex, setRoleIndex] = useState(2);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [permittedWallet, setPermittedWallet] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      roleIndex,
      startTime:
        roleIndex === 4 ? Math.floor(new Date(startTime).getTime() / 1000) : 0,
      endTime:
        roleIndex === 4 ? Math.floor(new Date(endTime).getTime() / 1000) : 0,
      permittedWallet,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Add Permission</h3>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="form-control">
            <label className="label">Role</label>
            <select
              className="select select-bordered"
              value={roleIndex}
              onChange={(e) => setRoleIndex(Number(e.target.value))}
            >
              <option value={2}>Admin</option>
              <option value={3}>Full Access</option>
              <option value={4}>Time Limited</option>
            </select>
          </div>

          <div className="form-control">
            <label className="label">Permitted Wallet</label>
            <input
              type="text"
              className="input input-bordered"
              value={permittedWallet}
              onChange={(e) => setPermittedWallet(e.target.value)}
              placeholder="Enter wallet address"
            />
          </div>

          {roleIndex === 4 && (
            <>
              <div className="form-control">
                <label className="label">Start Time</label>
                <input
                  type="datetime-local"
                  className="input input-bordered"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className="form-control">
                <label className="label">End Time</label>
                <input
                  type="datetime-local"
                  className="input input-bordered"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </>
          )}

          <div className="modal-action">
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Add Permission
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
