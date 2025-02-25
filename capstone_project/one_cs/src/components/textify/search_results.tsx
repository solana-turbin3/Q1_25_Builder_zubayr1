"use client";

import { useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { useOneCsProgram } from "./one_cs-data-access";
import { ellipsify } from "../ui/ui-layout";
import toast from "react-hot-toast";

export function SearchEncapsulatedData() {
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

export function SearchPermissionedData() {
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
