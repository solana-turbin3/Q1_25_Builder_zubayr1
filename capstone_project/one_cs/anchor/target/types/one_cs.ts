/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/one_cs.json`.
 */
export type OneCs = {
  "address": "coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF",
  "metadata": {
    "name": "oneCs",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "acceptOwnership",
      "docs": [
        "Accept ownership of the permission data account"
      ],
      "discriminator": [
        172,
        23,
        43,
        13,
        238,
        213,
        85,
        150
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "encapsulatedData",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  101,
                  114,
                  109,
                  105,
                  115,
                  115,
                  105,
                  111,
                  110,
                  115
                ]
              },
              {
                "kind": "const",
                "value": [
                  9,
                  43,
                  225,
                  230,
                  237,
                  13,
                  216,
                  237,
                  44,
                  121,
                  170,
                  202,
                  171,
                  13,
                  123,
                  122,
                  17,
                  76,
                  28,
                  165,
                  22,
                  109,
                  84,
                  97,
                  252,
                  22,
                  20,
                  59,
                  1,
                  116,
                  88,
                  174
                ]
              },
              {
                "kind": "arg",
                "path": "label"
              }
            ]
          }
        },
        {
          "name": "delegatedOwner",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  101,
                  108,
                  101,
                  103,
                  97,
                  116,
                  101,
                  100,
                  95,
                  111,
                  119,
                  110,
                  101,
                  114
                ]
              },
              {
                "kind": "const",
                "value": [
                  9,
                  43,
                  225,
                  230,
                  237,
                  13,
                  216,
                  237,
                  44,
                  121,
                  170,
                  202,
                  171,
                  13,
                  123,
                  122,
                  17,
                  76,
                  28,
                  165,
                  22,
                  109,
                  84,
                  97,
                  252,
                  22,
                  20,
                  59,
                  1,
                  116,
                  88,
                  174
                ]
              },
              {
                "kind": "arg",
                "path": "label"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "label",
          "type": "string"
        }
      ]
    },
    {
      "name": "addPermission",
      "docs": [
        "Add a new permission to the permission list"
      ],
      "discriminator": [
        144,
        66,
        124,
        76,
        232,
        97,
        99,
        77
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "encapsulatedData",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  101,
                  114,
                  109,
                  105,
                  115,
                  115,
                  105,
                  111,
                  110,
                  115
                ]
              },
              {
                "kind": "const",
                "value": [
                  9,
                  43,
                  225,
                  230,
                  237,
                  13,
                  216,
                  237,
                  44,
                  121,
                  170,
                  202,
                  171,
                  13,
                  123,
                  122,
                  17,
                  76,
                  28,
                  165,
                  22,
                  109,
                  84,
                  97,
                  252,
                  22,
                  20,
                  59,
                  1,
                  116,
                  88,
                  174
                ]
              },
              {
                "kind": "arg",
                "path": "label"
              }
            ]
          }
        },
        {
          "name": "permittedWallet"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "label",
          "type": "string"
        },
        {
          "name": "roleIndex",
          "type": "u64"
        },
        {
          "name": "startTime",
          "type": "u64"
        },
        {
          "name": "endTime",
          "type": "u64"
        }
      ]
    },
    {
      "name": "editData",
      "docs": [
        "Edit the encapsulated data"
      ],
      "discriminator": [
        121,
        33,
        103,
        228,
        44,
        194,
        87,
        176
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "encapsulatedData",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  101,
                  114,
                  109,
                  105,
                  115,
                  115,
                  105,
                  111,
                  110,
                  115
                ]
              },
              {
                "kind": "const",
                "value": [
                  9,
                  43,
                  225,
                  230,
                  237,
                  13,
                  216,
                  237,
                  44,
                  121,
                  170,
                  202,
                  171,
                  13,
                  123,
                  122,
                  17,
                  76,
                  28,
                  165,
                  22,
                  109,
                  84,
                  97,
                  252,
                  22,
                  20,
                  59,
                  1,
                  116,
                  88,
                  174
                ]
              },
              {
                "kind": "arg",
                "path": "label"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "label",
          "type": "string"
        },
        {
          "name": "data",
          "type": "string"
        }
      ]
    },
    {
      "name": "encapsulate",
      "docs": [
        "Encapsulate the data and create a new permission data account"
      ],
      "discriminator": [
        169,
        85,
        157,
        64,
        95,
        156,
        28,
        101
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "encapsulatedData",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  101,
                  114,
                  109,
                  105,
                  115,
                  115,
                  105,
                  111,
                  110,
                  115
                ]
              },
              {
                "kind": "const",
                "value": [
                  9,
                  43,
                  225,
                  230,
                  237,
                  13,
                  216,
                  237,
                  44,
                  121,
                  170,
                  202,
                  171,
                  13,
                  123,
                  122,
                  17,
                  76,
                  28,
                  165,
                  22,
                  109,
                  84,
                  97,
                  252,
                  22,
                  20,
                  59,
                  1,
                  116,
                  88,
                  174
                ]
              },
              {
                "kind": "arg",
                "path": "label"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "label",
          "type": "string"
        },
        {
          "name": "data",
          "type": "string"
        }
      ]
    },
    {
      "name": "removePermission",
      "docs": [
        "Remove a permission from the permission list"
      ],
      "discriminator": [
        122,
        51,
        186,
        238,
        78,
        104,
        205,
        204
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "encapsulatedData",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  101,
                  114,
                  109,
                  105,
                  115,
                  115,
                  105,
                  111,
                  110,
                  115
                ]
              },
              {
                "kind": "const",
                "value": [
                  9,
                  43,
                  225,
                  230,
                  237,
                  13,
                  216,
                  237,
                  44,
                  121,
                  170,
                  202,
                  171,
                  13,
                  123,
                  122,
                  17,
                  76,
                  28,
                  165,
                  22,
                  109,
                  84,
                  97,
                  252,
                  22,
                  20,
                  59,
                  1,
                  116,
                  88,
                  174
                ]
              },
              {
                "kind": "arg",
                "path": "label"
              }
            ]
          }
        },
        {
          "name": "permittedWallet"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "label",
          "type": "string"
        }
      ]
    },
    {
      "name": "transferOwnership",
      "docs": [
        "Transfer ownership of the permission data account"
      ],
      "discriminator": [
        65,
        177,
        215,
        73,
        53,
        45,
        99,
        47
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "encapsulatedData",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  101,
                  114,
                  109,
                  105,
                  115,
                  115,
                  105,
                  111,
                  110,
                  115
                ]
              },
              {
                "kind": "const",
                "value": [
                  9,
                  43,
                  225,
                  230,
                  237,
                  13,
                  216,
                  237,
                  44,
                  121,
                  170,
                  202,
                  171,
                  13,
                  123,
                  122,
                  17,
                  76,
                  28,
                  165,
                  22,
                  109,
                  84,
                  97,
                  252,
                  22,
                  20,
                  59,
                  1,
                  116,
                  88,
                  174
                ]
              },
              {
                "kind": "arg",
                "path": "label"
              }
            ]
          }
        },
        {
          "name": "delegatedOwner",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  101,
                  108,
                  101,
                  103,
                  97,
                  116,
                  101,
                  100,
                  95,
                  111,
                  119,
                  110,
                  101,
                  114
                ]
              },
              {
                "kind": "const",
                "value": [
                  9,
                  43,
                  225,
                  230,
                  237,
                  13,
                  216,
                  237,
                  44,
                  121,
                  170,
                  202,
                  171,
                  13,
                  123,
                  122,
                  17,
                  76,
                  28,
                  165,
                  22,
                  109,
                  84,
                  97,
                  252,
                  22,
                  20,
                  59,
                  1,
                  116,
                  88,
                  174
                ]
              },
              {
                "kind": "arg",
                "path": "label"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "label",
          "type": "string"
        },
        {
          "name": "newOwner",
          "type": "pubkey"
        },
        {
          "name": "ownershipTime",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "delegatedOwner",
      "discriminator": [
        46,
        106,
        155,
        80,
        149,
        206,
        156,
        161
      ]
    },
    {
      "name": "permissionData",
      "discriminator": [
        150,
        112,
        179,
        118,
        211,
        71,
        19,
        75
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "unauthorized",
      "msg": "Unauthorized publickey"
    },
    {
      "code": 6001,
      "name": "badRole",
      "msg": "Bad role"
    },
    {
      "code": 6002,
      "name": "invalidTime",
      "msg": "Invalid time"
    },
    {
      "code": 6003,
      "name": "timeNotReached",
      "msg": "Time not reached"
    }
  ],
  "types": [
    {
      "name": "delegatedOwner",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "newOwner",
            "type": "pubkey"
          },
          {
            "name": "ownershipTime",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "permission",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "role",
            "type": {
              "defined": {
                "name": "role"
              }
            }
          },
          {
            "name": "wallet",
            "type": "pubkey"
          },
          {
            "name": "startTime",
            "type": "u64"
          },
          {
            "name": "endTime",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "permissionData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "label",
            "type": "string"
          },
          {
            "name": "data",
            "type": "string"
          },
          {
            "name": "permissions",
            "type": {
              "vec": {
                "defined": {
                  "name": "permission"
                }
              }
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "role",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "owner"
          },
          {
            "name": "admin"
          },
          {
            "name": "fullAccess"
          },
          {
            "name": "timeLimited"
          }
        ]
      }
    }
  ]
};
