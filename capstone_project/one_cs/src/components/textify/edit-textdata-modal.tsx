"use client";

import { useState, useEffect } from "react";
import { PublicKey } from "@solana/web3.js";
import { useOneCsProgramAccount } from "./one_cs-data-access";
import toast from "react-hot-toast";

interface UseEditTextDataProps {
  account: PublicKey;
  data: {
    label: string;
    creator: PublicKey;
  };
  onSuccess: () => void;
}

export function useEditTextData({
  account,
  data,
  onSuccess,
}: UseEditTextDataProps) {
  const { editTextData } = useOneCsProgramAccount({ account });

  const handleEditData = async (formData: { content: string }) => {
    try {
      await editTextData.mutateAsync({
        label: data?.label || "",
        creator: data?.creator,
        data: formData.content,
      });
      onSuccess();
    } catch (err) {
      toast.error("Error editing data: " + err);
    }
  };

  return {
    handleEditData,
    isEditPending: editTextData.isPending,
  };
}

interface EditDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { content: string }) => void;
  currentContent: string;
}

export function EditTextDataModal({
  isOpen,
  onClose,
  onSubmit,
  currentContent,
}: EditDataModalProps) {
  const [text, setText] = useState(currentContent);
  const [contentType, setContentType] = useState<"text" | "json">("text");
  const [jsonError, setJsonError] = useState("");

  useEffect(() => {
    setText(currentContent);
    try {
      JSON.parse(currentContent);
      setContentType("json");
    } catch {
      setContentType("text");
    }
  }, [currentContent, isOpen]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text) {
      toast.error("Please enter content");
      return;
    }

    if (contentType === "json" && !validateJson(text)) {
      return;
    }

    onSubmit({ content: text });
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Edit Data</h3>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium">Content Type</span>
            </label>
            <div className="flex gap-4">
              <label className="label cursor-pointer">
                <input
                  type="radio"
                  className="radio"
                  checked={contentType === "text"}
                  onChange={() => setContentType("text")}
                />
                <span className="label-text ml-2">Text</span>
              </label>
              <label className="label cursor-pointer">
                <input
                  type="radio"
                  className="radio"
                  checked={contentType === "json"}
                  onChange={() => setContentType("json")}
                />
                <span className="label-text ml-2">JSON</span>
              </label>
            </div>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Content</span>
            </label>
            <textarea
              className="textarea textarea-bordered h-24"
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                if (contentType === "json") {
                  validateJson(e.target.value);
                }
              }}
              placeholder="Enter your content here"
            />
            {contentType === "json" && jsonError && (
              <label className="label">
                <span className="label-text-alt text-error">{jsonError}</span>
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
              disabled={contentType === "json" && jsonError !== ""}
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
