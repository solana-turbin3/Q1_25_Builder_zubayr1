use crate::error_state::ErrorCode;
use crate::state::*;
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(label: String)]
pub struct TransferOwnership<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    pub creator: SystemAccount<'info>,

    pub new_owner: SystemAccount<'info>,

    #[account(
      mut,
      seeds = [b"permissions", creator.key().as_ref(), label.as_ref()],
      bump = encapsulated_data.bump
    )]
    pub encapsulated_data: Account<'info, PermissionData>,

    #[account(
        mut,
        seeds = [b"permissioned_wallet".as_ref(), owner.key().as_ref(), label.as_ref()],
        bump = owner_permissioned_wallet.bump,
        constraint = owner_permissioned_wallet.main_data_pda == encapsulated_data.key()
            @ ErrorCode::Unauthorized
    )]
    pub owner_permissioned_wallet: Account<'info, PermissionedWallet>,

    #[account(
        init_if_needed,        
        payer = owner,
        space = 8 + PermissionedWallet::INIT_SPACE,
        seeds = [b"permissioned_wallet".as_ref(), new_owner.key().as_ref(), label.as_ref()],
        bump,
    )]
    pub new_owner_permissioned_wallet: Account<'info, PermissionedWallet>,

    #[account(
      init_if_needed,
      payer = owner,
      space = 8 + DelegatedOwner::INIT_SPACE,
      seeds = [b"delegated_owner", creator.key().as_ref(), label.as_ref()],
      bump
    )]
    pub delegated_owner: Account<'info, DelegatedOwner>,

    pub system_program: Program<'info, System>,
}

impl<'info> TransferOwnership<'info> {
    pub fn transfer_ownership(
        &mut self,
        _label: String,
        ownership_time: u64,
        bumps: &TransferOwnershipBumps,
    ) -> Result<()> {
        let encapsulated_data = &mut self.encapsulated_data;

        // Check if instant delegation or future delegation
        let current_time = Clock::get().unwrap().unix_timestamp as u64;
        if ownership_time < current_time {
            // Check if owner is the current owner
            if encapsulated_data.owner != self.owner.key() {
                return Err(ErrorCode::NotOwner.into());
            }

            encapsulated_data.owner = self.new_owner.key();

            // Update the old owner's permission to admin
            self.owner_permissioned_wallet.role = Role::Admin;

            // Update the new owner's permission to owner
            self.new_owner_permissioned_wallet.set_inner(PermissionedWallet {
                role: Role::Owner,
                main_data_pda: encapsulated_data.key(),
                bump: bumps.new_owner_permissioned_wallet,
                wallet: self.new_owner.key(),
                start_time: 0,
                end_time: 0,
            });
        } else {
            // Create a new delegated owner account
            self.delegated_owner.set_inner(DelegatedOwner {
                new_owner: self.new_owner.key(),
                ownership_time,
                bump: bumps.delegated_owner,
            });
        }
        Ok(())
    }
}
