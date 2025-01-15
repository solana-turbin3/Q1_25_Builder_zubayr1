import { Idl } from "@coral-xyz/anchor";

export type Turbin3Prereq = Idl & {
  version: string;
  name: string;
  instructions: Array<{
    name: string;
    discriminator: number[];
    accounts: Array<{
      name: string;
      address?: string;
      writable?: boolean;
      signer?: boolean;
      pda?: {
        seeds: Array<{
          kind: "const" | "account";
          value?: number[];
          path?: string;
        }>;
      };
    }>;
    args: Array<{ name: string; type: string }>;
  }>;
};

export const IDL: Turbin3Prereq = {
  address: "WBAQSygkwMox2VuWKU133NxFrpDZUBdvSBeaBEue2Jq",
  metadata: {
    name: "wba_prereq",
    version: "0.1.0",
    spec: "0.1.0",
    description: "Created with Anchor",
  },
  instructions: [
    {
      name: "complete",
      discriminator: [0, 77, 224, 147, 136, 25, 88, 76],
      accounts: [
        {
          name: "signer",
          writable: true,
          signer: true,
        },
        {
          name: "prereq",
          writable: true,
          pda: {
            seeds: [
              { kind: "const", value: [112, 114, 101, 114, 101, 113] },
              { kind: "account", path: "signer" },
            ],
          },
        },
        {
          name: "system_program",
          address: "11111111111111111111111111111111",
        },
      ],
      args: [{ name: "github", type: "bytes" }],
    },
    {
      name: "update",
      discriminator: [219, 200, 88, 176, 158, 63, 253, 127],
      accounts: [
        {
          name: "signer",
          writable: true,
          signer: true,
        },
        {
          name: "prereq",
          writable: true,
        },
        {
          name: "system_program",
          address: "11111111111111111111111111111111",
        },
      ],
      args: [{ name: "github", type: "bytes" }],
    },
  ],
  accounts: [
    {
      name: "Q2Prereq2024",
      discriminator: [210, 203, 168, 103, 251, 233, 204, 6],
    },
  ],
  errors: [
    {
      code: 6000,
      name: "InvalidGithubAccount",
      msg: "Invalid Github account",
    },
  ],
  types: [
    {
      name: "Q2Prereq2024",
      type: {
        kind: "struct",
        fields: [
          { name: "github", type: "bytes" },
          { name: "key", type: "pubkey" },
        ],
      },
    },
  ],
} as Turbin3Prereq;
