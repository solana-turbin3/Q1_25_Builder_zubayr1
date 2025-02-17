use crate::error_state::ErrorCode;
use crate::state::*;
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(label: String)]
pub struct RemovePermission<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    pub creator: SystemAccount<'info>,

    pub permitted_wallet: SystemAccount<'info>,

    #[account(
      seeds = [b"permissions", creator.key().as_ref(), label.as_ref()],
      bump = encapsulated_data.bump,
    )]
    pub encapsulated_data: Account<'info, PermissionData>,

    #[account(
      seeds = [b"permissioned_wallet".as_ref(), payer.key().as_ref(), label.as_ref()],
      bump = payer_permissioned_wallet.bump,
      constraint = payer_permissioned_wallet.main_data_pda == encapsulated_data.key()
        @ ErrorCode::Unauthorized
    )]
    pub payer_permissioned_wallet: Account<'info, PermissionedWallet>,

    #[account(
      mut,
      close = payer,
      seeds = [b"permissioned_wallet".as_ref(), permitted_wallet.key().as_ref(), label.as_ref()],
      bump = permissioned_wallet.bump,
      constraint = permissioned_wallet.main_data_pda == encapsulated_data.key()
        @ ErrorCode::Unauthorized
    )]
    pub permissioned_wallet: Account<'info, PermissionedWallet>,

    pub system_program: Program<'info, System>,
}

impl<'info> RemovePermission<'info> {
    pub fn remove_permission(&mut self, _label: String) -> Result<()> {
        // Check if the payer has the full access or time limited access. If so, return an error.
        if self.payer_permissioned_wallet.role == Role::FullAccess
            || self.payer_permissioned_wallet.role == Role::TimeLimited
        {
            return Err(error!(ErrorCode::Unauthorized));
        }

        // If payer is admin, payer can't remove another admin
        if self.payer_permissioned_wallet.role == Role::Admin
            && self.permissioned_wallet.role == Role::Admin
        {
            return Err(error!(ErrorCode::Unauthorized));
        }

        Ok(())
    }
}
