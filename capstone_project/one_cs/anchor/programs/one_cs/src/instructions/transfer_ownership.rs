use crate::error_state::ErrorCode;
use crate::state::*;
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(label: String)]
pub struct TransferOwnership<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    pub creator: SystemAccount<'info>,

    #[account(
      mut,
      seeds = [b"permissions", creator.key().as_ref(), label.as_ref()],
      bump = encapsulated_data.bump,
      realloc = 8 + PermissionData::INIT_SPACE,
      realloc::payer = owner,
      realloc::zero = true
    )]
    pub encapsulated_data: Account<'info, PermissionData>,

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
        new_owner: Pubkey,
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

            let old_owner = encapsulated_data.owner;
            encapsulated_data.owner = new_owner;

            // Update the old owner's permission to admin
            if let Some(old_owner_permission) = encapsulated_data
                .permissions
                .iter_mut()
                .find(|p| p.wallet == old_owner)
            {
                old_owner_permission.role = Role::Admin;
            }

            // Update the new owner's permission to owner
            if let Some(new_owner_permission) = encapsulated_data
                .permissions
                .iter_mut()
                .find(|p| p.wallet == new_owner)
            {
                new_owner_permission.role = Role::Owner;
            } else {
                // Add the new owner's permission to the permission list
                encapsulated_data.permissions.push(Permission {
                    role: Role::Owner,
                    wallet: new_owner,
                    start_time: 0,
                    end_time: 0,
                });
            }
        } else {
            // Create a new delegated owner account
            self.delegated_owner.set_inner(DelegatedOwner {
                new_owner,
                ownership_time,
                bump: bumps.delegated_owner,
            });
        }
        Ok(())
    }
}
