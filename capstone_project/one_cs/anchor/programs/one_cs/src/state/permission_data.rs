use anchor_lang::prelude::*;

#[derive(InitSpace, AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum Role {
    Owner = 1,       // Owner: the creator of the permission data account
    Admin = 2,       // Admin: Owner, can add/remove permissions
    FullAccess = 3,  // FullAccess: Can access the encapsulated data
    TimeLimited = 4, // TimeLimited: Can access the encapsulated data for a limited time
}

#[derive(InitSpace, AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub struct Permission {
    pub role: Role,
    pub wallet: Pubkey,
    pub start_time: u64,
    pub end_time: u64,
}

#[account]
#[derive(InitSpace)]
pub struct TokenData {
    pub token_mint: Pubkey,
    pub token_amount: u64,
}

#[account]
#[derive(InitSpace)]
pub struct EncapsulatedData {
    #[max_len(256)]
    pub text: Option<String>, // Optional text data
    pub token: Option<TokenData>, // Optional token data
}

#[account]
#[derive(InitSpace)]
pub struct PermissionData {
    pub owner: Pubkey,
    #[max_len(32)]
    pub label: String,
    pub data: EncapsulatedData,
    #[max_len(5, 100)]
    pub permissions: Vec<Permission>,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct DelegatedOwner {
    pub new_owner: Pubkey,
    pub ownership_time: u64,
    pub bump: u8,
}
