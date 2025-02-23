"use client";

import { AppHero } from "../ui/ui-layout";
import { OneCsList } from "./one_cs-ui";

const links: { label: string; href: string }[] = [
  {
    label: "OneCS GitHub",
    href: "https://github.com/zubayr1/TURBIN3_Q1_25/tree/main/capstone_project",
  },
  {
    label: "OneCS Documentation",
    href: "https://github.com/zubayr1/TURBIN3_Q1_25/tree/main/capstone_project",
  },
];

export default function OneCsLandingPage() {
  return (
    <div>
      <AppHero
        title="Welcome to 1CS"
        subtitle="Flexible On-Chain Data Encapsulation and Permissioning Protocol"
      />

      <div className="max-w-xl mx-auto py-6 sm:px-6 lg:px-8 text-center">
        <div className="space-y-2">
          <p>
            1CS (One-Chain Share) is a next-generation protocol for sharing and
            managing on-chain data with flexible permissions. Easily encapsulate
            text, tokens, or any asset while granting multiple wallets custom
            access roles—no multisig required.
          </p>
          <p>Here are some helpful links to learn more and get started:</p>
          {links.map((link, index) => (
            <div key={index}>
              <a
                href={link.href}
                className="link"
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.label}
              </a>
            </div>
          ))}
        </div>
      </div>

      <OneCsList />
    </div>
  );
}
