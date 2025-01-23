use anchor_lang::prelude::*;

mod state;
mod instructions;

use state::*;
use instructions::*;

declare_id!("FWYA7T8maAWUeWvsUSBfJQJvtb9hx61Fj6hkVBsUBEnh");

#[program]
pub mod escrow_new {
    use super::*;

    pub fn initialize(ctx: Context<Make>, seed: u64, receive: u64) -> Result<()> {
        ctx.accounts.init_escrow(seed, receive, &ctx.bumps)?;

        Ok(())
    }

    pub fn deposit(ctx: Context<Make>, deposit: u64) -> Result<()> {
        ctx.accounts.deposit(deposit)?;
        Ok(())
    }

    pub fn deposit_by_taker(ctx: Context<Take>) -> Result<()> {
        ctx.accounts.deposit_by_taker()?;
        Ok(())
    }

    pub fn withdraw_and_close_vault(ctx: Context<Take>) -> Result<()> {
        ctx.accounts.withdraw_and_close_vault()?;
        Ok(())
    }
}
