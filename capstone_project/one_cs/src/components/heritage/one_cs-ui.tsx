"use client";

import { PublicKey } from "@solana/web3.js";
import { ellipsify } from "../ui/ui-layout";
import { useState, useEffect } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { useOneCsProgram, useOneCsProgramAccount } from "./one_cs-data-access";
import toast from "react-hot-toast";
import { BN } from "@coral-xyz/anchor";
import { Connection } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { ExplorerLink } from "../cluster/cluster-ui";
import { getAssociatedTokenAddress } from "@solana/spl-token";

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

interface TransferOwnershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { newOwner: string; ownershipTime: number }) => void;
}

interface AcceptOwnershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  label: string;
  currentOwner: string;
}

interface EditDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  tokenAmount: BN;
  tokenMint: PublicKey;
}

async function getTokenMintAddresses(
  connection: Connection,
  userPubkey: PublicKey
): Promise<{ mint: PublicKey; balance: string }[]> {
  const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
    userPubkey,
    { programId: TOKEN_PROGRAM_ID }
  );

  return tokenAccounts.value.map((tokenAccount) => {
    const parsedInfo = tokenAccount.account.data.parsed.info;
    return {
      mint: new PublicKey(parsedInfo.mint),
      balance: parsedInfo.tokenAmount.uiAmount,
    };
  });
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

function TransferOwnershipModal({
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

function AcceptOwnershipModal({
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

function EditDataModal({
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

export function OneCsCreate() {
  const { initEscrow, depositTokens, encapsulateToken } = useOneCsProgram();
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [availableTokens, setAvailableTokens] = useState<
    { mint: PublicKey; balance: string }[]
  >([]);

  const [label, setLabel] = useState("");
  const [tokenMint, setTokenMint] = useState("");
  const [tokenAmount, setTokenAmount] = useState("");

  useEffect(() => {
    if (publicKey) {
      getTokenMintAddresses(connection, publicKey)
        .then(setAvailableTokens)
        .catch(console.error);
    }
  }, [connection, publicKey]);

  const handleSubmit = async () => {
    if (!publicKey || !label || !tokenMint || !tokenAmount) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const tokenMintPubkey = new PublicKey(tokenMint);

      // Get token mint info for decimals
      const mintInfo = await connection.getParsedAccountInfo(tokenMintPubkey);
      const decimals = (mintInfo.value?.data as any).parsed.info.decimals;

      // First init the escrow
      await initEscrow.mutateAsync({
        label,
        creator: publicKey,
        tokenMint: tokenMintPubkey,
      });

      // If init succeeds, immediately deposit tokens
      await depositTokens.mutateAsync({
        label,
        creator: publicKey,
        tokenMint: tokenMintPubkey,
        amount: new BN(parseFloat(tokenAmount) * Math.pow(10, decimals)),
      });

      // Encapsulate the token
      await encapsulateToken.mutateAsync({
        label,
        creator: publicKey,
        tokenMint: tokenMintPubkey,
      });

      toast.success("Token encapsulated successfully!");
    } catch (err) {
      toast.error("Error in operation: " + err);
    }
  };

  return (
    <div className="card bg-base-200 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Encapsulate Token</h2>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text font-medium">Label</span>
          </label>
          <input
            type="text"
            placeholder="Enter a unique identifier"
            className="input input-bordered w-full"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
        </div>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text font-medium">Token Mint</span>
          </label>
          <select
            className="select select-bordered w-full"
            value={tokenMint}
            onChange={(e) => setTokenMint(e.target.value)}
          >
            <option value="">Select a token</option>
            {availableTokens.map((token) => (
              <option key={token.mint.toString()} value={token.mint.toString()}>
                {token.mint.toString()} (Balance: {token.balance})
              </option>
            ))}
          </select>
        </div>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text font-medium">Token Amount</span>
          </label>
          <input
            type="number"
            placeholder="Enter amount of tokens"
            className="input input-bordered w-full"
            value={tokenAmount}
            onChange={(e) => setTokenAmount(e.target.value)}
          />
        </div>

        <div className="card-actions justify-end mt-4">
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={
              initEscrow.isPending || !label || !tokenMint || !tokenAmount
            }
          >
            {initEscrow.isPending ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Encapsulating...
              </>
            ) : (
              "Encapsulate"
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

  // Filter for only token encapsulations
  const tokenAccounts = accounts.data?.filter((account) => {
    const data = account.account as PermissionData;
    return data?.data.token !== null; // Only show accounts with token data
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
        <p className="text-xl font-semibold mb-4">All Encapsulated Tokens</p>
        {accounts.isLoading ? (
          <span className="loading loading-spinner loading-lg"></span>
        ) : tokenAccounts?.length ? (
          <div className="grid md:grid-cols-2 gap-4">
            {tokenAccounts.map((account) => (
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

      // Only show result if it's a token encapsulation
      if (accountData.data.token === null) {
        toast.error("No token encapsulation found with this label");
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
                <span className="font-bold">Token Mint:</span>{" "}
                {ellipsify(searchResult.data.token.tokenMint.toString())}
              </p>
              <p>
                <span className="font-bold">Amount:</span>{" "}
                {searchResult.data.token.tokenAmount.toString()}
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

      // Filter for only token encapsulations that user has permission for
      const userPermissionData = allPermissionData.filter(
        (pd) =>
          mainDataPdas.some(
            (pda) => pda.toString() === pd.publicKey.toString()
          ) && pd.account.data.token !== null // Only include token encapsulations
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
                      <span className="font-bold">Token Mint:</span>{" "}
                      {ellipsify(result.data.token.tokenMint.toString())}
                    </p>
                    <p>
                      <span className="font-bold">Amount:</span>{" "}
                      {result.data.token.tokenAmount.toString()}
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
      setIsTransferModalOpen(false);
    } catch (err) {
      toast.error("Error transferring ownership: " + err);
    }
  };

  const handleAcceptOwnership = () => {
    try {
      acceptOwnership.mutateAsync({
        label: data?.label || "",
        creator: data?.creator,
      });
      setIsAcceptModalOpen(false);
    } catch (err) {
      toast.error("Error accepting ownership: " + err);
    }
  };

  const handleEditData = async () => {
    try {
      if (!data?.data.token) {
        toast.error("No token data found");
        return;
      }

      // Get the associated token account for the owner's wallet
      const takerTokenAccount = await getAssociatedTokenAddress(
        data.data.token.tokenMint,
        data.owner
      );

      editTokenData.mutateAsync({
        label: data?.label || "",
        creator: data?.creator,
        payer: account,
        owner: account,
        taker: takerTokenAccount, // Use the token account instead of wallet address
        amount: data.data.token.tokenAmount,
        isDeposit: false,
        tokenMint: data.data.token.tokenMint,
      });
      setIsEditModalOpen(false);
    } catch (err) {
      toast.error("Error withdrawing tokens: " + err);
    }
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
                  <button onClick={() => setIsEditModalOpen(true)}>
                    Edit Data
                  </button>
                </li>
                <li>
                  <button onClick={() => setIsTransferModalOpen(true)}>
                    Transfer Ownership
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setIsAcceptModalOpen(true)}
                    disabled={acceptOwnership.isPending}
                  >
                    {acceptOwnership.isPending ? (
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
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
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
