use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Marketplace {
    pub admin: Pubkey,
    pub fee: u16,
    pub treasury_bump: u8,
    pub reward_mint_bump: u8,
    #[max_len(32)]
    pub name: String,
    pub bump: u8,
}
