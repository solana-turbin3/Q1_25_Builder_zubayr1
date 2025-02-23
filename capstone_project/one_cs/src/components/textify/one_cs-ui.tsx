"use client";

import { Keypair, PublicKey } from "@solana/web3.js";
import { useMemo, useState } from "react";
import { ellipsify } from "../ui/ui-layout";
import { ExplorerLink } from "../cluster/cluster-ui";
import { useOneCsProgram, useOneCsProgramAccount } from "./one_cs-data-access";
import { useWallet } from "@solana/wallet-adapter-react";
import toast from "react-hot-toast";
import { BN } from "@coral-xyz/anchor";

interface PermissionData {
  label: string;
  creator: PublicKey;
  owner: PublicKey;
  data: {
    text: string | null;
    token: { tokenMint: PublicKey; tokenAmount: BN } | null;
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

function AddPermissionModal({
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

export function OneCsCreate() {
  const { encapsulateText } = useOneCsProgram();
  const { publicKey } = useWallet();

  const [label, setLabel] = useState("");
  const [text, setText] = useState("");
  const [contentType, setContentType] = useState<"text" | "json">("text");
  const [jsonError, setJsonError] = useState("");

  const validateJson = (value: string) => {
    try {
      JSON.parse(value);
      setJsonError("");
      return true;
    } catch (e) {
      setJsonError("Invalid JSON format");
      return false;
    }
  };

  const handleSubmit = () => {
    if (!label || !text) {
      toast.error("Please fill in all fields");
      return;
    }

    if (contentType === "json" && !validateJson(text)) {
      return;
    }

    if (publicKey) {
      encapsulateText.mutateAsync({
        label,
        data: text, // Both JSON and text are sent as strings
        creator: publicKey,
      });
    } else {
      toast.error("Please connect your wallet");
    }
  };

  return (
    <div className="card bg-base-200 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Create New Encapsulation</h2>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text font-medium">Label</span>
          </label>
          <input
            type="text"
            placeholder="Enter a unique label"
            className="input input-bordered w-full"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
        </div>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text font-medium">Content Type</span>
          </label>
          <div className="flex gap-4 mb-2">
            <label className="cursor-pointer flex items-center">
              <input
                type="radio"
                className="radio radio-primary"
                checked={contentType === "text"}
                onChange={() => setContentType("text")}
              />
              <span className="ml-2">Text</span>
            </label>
            <label className="cursor-pointer flex items-center">
              <input
                type="radio"
                className="radio radio-primary"
                checked={contentType === "json"}
                onChange={() => setContentType("json")}
              />
              <span className="ml-2">JSON</span>
            </label>
          </div>
          <textarea
            placeholder={
              contentType === "json"
                ? "Enter valid JSON data"
                : "Enter your text content"
            }
            className={`textarea textarea-bordered w-full h-32 font-mono ${
              jsonError ? "textarea-error" : ""
            }`}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (contentType === "json") {
                validateJson(e.target.value);
              }
            }}
          />
          {contentType === "json" && jsonError && (
            <label className="label">
              <span className="label-text-alt text-error">{jsonError}</span>
            </label>
          )}
        </div>

        <div className="card-actions justify-end mt-4">
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={
              encapsulateText.isPending ||
              !label ||
              !text ||
              (contentType === "json" && !!jsonError)
            }
          >
            {encapsulateText.isPending ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Creating...
              </>
            ) : (
              "Create"
            )}
          </button>
        </div>
      </div>
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

function SearchEncapsulatedData() {
  const [label, setLabel] = useState("");
  const [creator, setCreator] = useState("");
  const [searchResult, setSearchResult] = useState<null | any>(null);
  const { program, programId } = useOneCsProgram();

  const handleSearch = async () => {
    try {
      const creatorPubkey = new PublicKey(creator);
      const [encapsulatedDataPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("permissions"),
          creatorPubkey.toBuffer(),
          Buffer.from(label),
        ],
        programId
      );
      const accountData = await program.account.permissionData.fetch(
        encapsulatedDataPda
      );

      // Only show result if it's a text encapsulation
      if (accountData.data.text === null) {
        toast.error("No text encapsulation found with this label");
        setSearchResult(null);
        return;
      }

      setSearchResult(accountData);
    } catch (err) {
      toast.error("Error searching: " + err);
      setSearchResult(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Creator Public Key"
          className="input input-bordered flex-1"
          value={creator}
          onChange={(e) => setCreator(e.target.value)}
        />
        <input
          type="text"
          placeholder="Label"
          className="input input-bordered flex-1"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
        <button
          className="btn btn-primary"
          onClick={handleSearch}
          disabled={!label || !creator}
        >
          Search
        </button>
      </div>

      {searchResult && (
        <div className="card bg-base-200">
          <div className="card-body">
            <h3 className="card-title">{searchResult.label}</h3>
            <div className="space-y-2">
              <p>
                <span className="font-bold">Content:</span>{" "}
                {searchResult.data.text || "N/A"}
              </p>
              <p>
                <span className="font-bold">Owner:</span>{" "}
                {ellipsify(searchResult.owner.toString())}
              </p>
              <p>
                <span className="font-bold">Creator:</span>{" "}
                {ellipsify(searchResult.creator.toString())}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SearchPermissionedData() {
  const [wallet, setWallet] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const { program } = useOneCsProgram();

  const handleSearch = async () => {
    try {
      const walletPubkey = new PublicKey(wallet);

      // Get all permission wallet PDAs
      const allPermissionWallets =
        await program.account.permissionedWallet.all();

      // Filter for wallets matching user's pubkey
      const userPermissionWallets = allPermissionWallets.filter(
        (pw) => pw.account.wallet.toString() === walletPubkey.toString()
      );

      // Get main data PDAs from matching permission wallets
      const mainDataPdas = userPermissionWallets.map(
        (pw) => pw.account.mainDataPda
      );

      // Get all permission data accounts
      const allPermissionData = await program.account.permissionData.all();

      // Filter for only text encapsulations that user has permission for
      const userPermissionData = allPermissionData.filter(
        (pd) =>
          mainDataPdas.some(
            (pda) => pda.toString() === pd.publicKey.toString()
          ) && pd.account.data.text !== null // Only include text encapsulations
      );

      setSearchResults(
        userPermissionData.map((pd) => ({
          ...pd.account,
          role: userPermissionWallets.find(
            (pw) =>
              pw.account.mainDataPda.toString() === pd.publicKey.toString()
          )?.account.role,
        }))
      );
    } catch (err) {
      toast.error("Error searching: " + err);
      setSearchResults([]);
    }
  };

  return (
    <div className="mb-8">
      <div className="space-y-4">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Enter Wallet Address"
            className="input input-bordered flex-1"
            value={wallet}
            onChange={(e) => setWallet(e.target.value)}
          />
          <button
            className="btn btn-primary"
            onClick={handleSearch}
            disabled={!wallet}
          >
            Search
          </button>
        </div>

        {searchResults.length > 0 && (
          <div className="space-y-4">
            {searchResults.map((result, i) => (
              <div key={i} className="card bg-base-200">
                <div className="card-body">
                  <div className="flex justify-between items-center">
                    <h3 className="card-title">{result.label}</h3>
                    <span className="badge">
                      {result.role.owner
                        ? "Owner"
                        : result.role.admin
                        ? "Admin"
                        : result.role.fullAccess
                        ? "Full Access"
                        : result.role.timeLimited
                        ? "Time Limited"
                        : "Unknown"}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <p>
                      <span className="font-bold">Content:</span>{" "}
                      {result.data.text || "N/A"}
                    </p>
                    <p>
                      <span className="font-bold">Owner:</span>{" "}
                      {ellipsify(result.owner.toString())}
                    </p>
                    <p>
                      <span className="font-bold">Creator:</span>{" "}
                      {ellipsify(result.creator.toString())}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function OneCsCard({ account }: { account: PublicKey }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { accountQuery, addPermission } = useOneCsProgramAccount({ account });
  const data = accountQuery.data as PermissionData;

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
      setIsModalOpen(false);
    } catch (err) {
      toast.error("Error adding permission: " + err);
    }
  };

  return accountQuery.isLoading ? (
    <span className="loading loading-spinner loading-lg"></span>
  ) : (
    <div className="card card-bordered border-4 border-primary bg-primary/10">
      <div className="card-body">
        <div className="space-y-4">
          {/* Header with Type Badge */}
          <div className="flex justify-between items-center">
            <h2 className="card-title text-lg">{data?.label || "N/A"}</h2>
            <div className="badge badge-primary">Text</div>
          </div>

          {/* Content */}
          <div className="text-left space-y-2">
            <div className="bg-base-200 p-3 rounded-lg min-h-[60px]">
              {data?.data.text || "No content"}
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
              <label tabIndex={0} className="btn btn-sm btn-primary">
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
                    onClick={() => setIsModalOpen(true)}
                    disabled={addPermission.isPending}
                  >
                    {addPermission.isPending ? (
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
                  <button onClick={() => {}}>Edit Data</button>
                </li>
                <li>
                  <button onClick={() => {}}>Transfer Ownership</button>
                </li>
                <li>
                  <button onClick={() => {}}>Accept Ownership</button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <AddPermissionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddPermission}
      />
    </div>
  );
}
