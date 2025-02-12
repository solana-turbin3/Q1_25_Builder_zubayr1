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
      "name": "depositTokens",
      "docs": [
        "Deposit tokens into the escrow"
      ],
      "discriminator": [
        176,
        83,
        229,
        18,
        191,
        143,
        176,
        150
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenMint",
          "writable": true
        },
        {
          "name": "ownerAta",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "owner"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "escrow",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  115,
                  99,
                  114,
                  111,
                  119
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
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "escrow"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        }
      ],
      "args": [
        {
          "name": "label",
          "type": "string"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "editTextData",
      "docs": [
        "Edit the encapsulated text data"
      ],
      "discriminator": [
        157,
        69,
        231,
        1,
        177,
        26,
        172,
        93
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
      "name": "editTokenData",
      "docs": [
        "Edit the encapsulated token data"
      ],
      "discriminator": [
        21,
        83,
        124,
        93,
        244,
        13,
        242,
        112
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "taker"
        },
        {
          "name": "owner"
        },
        {
          "name": "tokenMint",
          "relations": [
            "escrow"
          ]
        },
        {
          "name": "escrow",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  115,
                  99,
                  114,
                  111,
                  119
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
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "escrow"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "payerAta",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "payer"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "takerAta",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "taker"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "ownerAta",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "owner"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
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
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        }
      ],
      "args": [
        {
          "name": "label",
          "type": "string"
        },
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "isDeposit",
          "type": "bool"
        }
      ]
    },
    {
      "name": "encapsulateText",
      "docs": [
        "Encapsulate the text data and create a new permission data account"
      ],
      "discriminator": [
        29,
        25,
        38,
        151,
        203,
        100,
        139,
        190
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
      "name": "encapsulateToken",
      "docs": [
        "Encapsulate a token"
      ],
      "discriminator": [
        66,
        222,
        86,
        103,
        24,
        153,
        203,
        26
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenMint",
          "writable": true
        },
        {
          "name": "ownerAta",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "owner"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "escrow",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  115,
                  99,
                  114,
                  111,
                  119
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
          "name": "vault",
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "escrow"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
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
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
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
      "name": "initEscrow",
      "docs": [
        "Init escrow"
      ],
      "discriminator": [
        70,
        46,
        40,
        23,
        6,
        11,
        81,
        139
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenMint"
        },
        {
          "name": "escrow",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  115,
                  99,
                  114,
                  111,
                  119
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
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "escrow"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
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
      "name": "escrow",
      "discriminator": [
        31,
        213,
        123,
        187,
        186,
        22,
        218,
        155
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
    },
    {
      "code": 6004,
      "name": "amountTooLarge",
      "msg": "Amount too large"
    },
    {
      "code": 6005,
      "name": "notOwner",
      "msg": "Not owner"
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
      "name": "encapsulatedData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "text",
            "type": {
              "option": "string"
            }
          },
          {
            "name": "token",
            "type": {
              "option": {
                "defined": {
                  "name": "tokenData"
                }
              }
            }
          }
        ]
      }
    },
    {
      "name": "escrow",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "tokenMint",
            "type": "pubkey"
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
            "type": {
              "defined": {
                "name": "encapsulatedData"
              }
            }
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
    },
    {
      "name": "tokenData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "tokenMint",
            "type": "pubkey"
          },
          {
            "name": "tokenAmount",
            "type": "u64"
          }
        ]
      }
    }
  ]
};
