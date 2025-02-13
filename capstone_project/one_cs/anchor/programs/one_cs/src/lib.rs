#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

pub mod error_state;
pub mod instructions;
pub mod state;

pub use instructions::*;
pub use state::*;

declare_id!("coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF");

#[program]
pub mod one_cs {
    use super::*;

    /// Encapsulate the text data and create a new permission data account
    pub fn encapsulate_text(
        ctx: Context<EncapsulateText>,
        label: String,
        data: String,
    ) -> Result<()> {
        ctx.accounts.encapsulate_text(&ctx.bumps, label, data)?;

        Ok(())
    }

    /// Add a new permission to the permission list
    pub fn add_permission(
        ctx: Context<AddPermission>,
        _label: String,
        role_index: u64,
        start_time: u64,
        end_time: u64,
    ) -> Result<()> {
        ctx.accounts
            .add_permission(_label, role_index, start_time, end_time)?;

        Ok(())
    }

    /// Remove a permission from the permission list
    pub fn remove_permission(ctx: Context<RemovePermission>, _label: String) -> Result<()> {
        ctx.accounts.remove_permission(_label)?;

        Ok(())
    }

    /// Edit the encapsulated text data
    pub fn edit_text_data(ctx: Context<EditTextData>, _label: String, data: String) -> Result<()> {
        ctx.accounts.edit_text_data(_label, data)?;

        Ok(())
    }

    /// Transfer ownership of the permission data account
    pub fn transfer_ownership(
        ctx: Context<TransferOwnership>,
        _label: String,
        new_owner: Pubkey,
        ownership_time: u64,
    ) -> Result<()> {
        ctx.accounts
            .transfer_ownership(_label, new_owner, ownership_time, &ctx.bumps)?;

        Ok(())
    }

    /// Accept ownership of the permission data account
    pub fn accept_ownership(ctx: Context<AcceptOwnership>, _label: String) -> Result<()> {
        ctx.accounts.accept_ownership(_label)?;

        Ok(())
    }

    /// Init escrow
    pub fn init_escrow(ctx: Context<InitEscrow>, label: String) -> Result<()> {
        ctx.accounts.init_escrow(label, &ctx.bumps)?;

        Ok(())
    }

    /// Deposit tokens into the escrow
    pub fn deposit_tokens(ctx: Context<DepositEscrow>, label: String, amount: u64) -> Result<()> {
        ctx.accounts.deposit_tokens(label, amount)?;

        Ok(())
    }

    /// Encapsulate a token
    pub fn encapsulate_token(ctx: Context<EncapsulateToken>, label: String) -> Result<()> {
        ctx.accounts.encapsulate_token(label, &ctx.bumps)?;

        Ok(())
    }

    /// Edit the encapsulated token data
    pub fn edit_token_data(
        ctx: Context<EditTokenData>,
        label: String,
        amount: u64,
        is_deposit: bool,
    ) -> Result<()> {
        ctx.accounts.edit_token_data(label, amount, is_deposit)?;

        Ok(())
    }

    /// Close the escrow manually
    pub fn close_escrow_manually(ctx: Context<CloseEscrowManually>, label: String) -> Result<()> {
        ctx.accounts.close_escrow_manually(label)?;

        Ok(())
    }
}
