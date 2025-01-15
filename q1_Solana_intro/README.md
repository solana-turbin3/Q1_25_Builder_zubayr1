## Solana Intro

### Required Tools

Rust, Yarn, Node Js, Solana CLI, Anchor Version Manager

### Accounts

Everything on chain
On creation, space is allocated and rent is paid
Can only created by system program

### Program Accounts

Executable accounts
Stateless
Owned by loader
Accessable by program Id
Native programs are provided by Solana

### Rent

Must be paid to create accounts
Closing accounts allows rent to be refunded

### Transaction

Atomic, if one instruction fails, transaction fails

### Compute

All one chain actions require compute units

### PDA

Made by seeds and bump
Cant collide with other PDA from other programs
Example: Associated Token Account
Can be used as hashmap
PDA account ids look similar to addresses but have no corresponding private key

### IDL

Many on chain programs (eg written in Anchor) have an IDL
Written in JSON

### SPL Token

Must create the Mint account first
Use spl-token library
Create mint and then use associated token account

#### Some functions

```
    initialize_mint: Creates a new token mint
    mint_to: Mints tokens to an account
    transfer: Transfers tokens from one account to another
    approve: Allows an account to transfer tokens on behalf of another account
    transfer_checked: Transfers tokens from one account to another with a specified amount
    transfer_from: Transfers tokens from one account to another using an allowance
```

### Associated Token Account

Creates a determistic token account
Other addresses can create for my behalf

#### Some functions

```
    create_associated_token_account: Creates an associated token account for a given token mint and owner
    get_associated_token_address: Calculates the associated token account address for a given token mint and owner
    get_or_create_associated_token_account: Creates an associated token account for a given token mint and owner if it doesn't exist
```
