"use client";

import { useState } from "react";
import toast from "react-hot-toast";

import { useWallet } from "@solana/wallet-adapter-react";

import { useOneCsProgram } from "./one_cs-data-access";

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
        data: text,
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
