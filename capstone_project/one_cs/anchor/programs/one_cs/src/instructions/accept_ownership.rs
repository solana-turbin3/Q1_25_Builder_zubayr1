use crate::error_state::ErrorCode;
use crate::state::*;
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(label: String)]
pub struct AcceptOwnership<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        mut,
        seeds = [b"permissions", crate::ID.as_ref(), label.as_ref()],
        bump = encapsulated_data.bump,
        realloc = 8 + PermissionData::INIT_SPACE,
        realloc::payer = signer,
        realloc::zero = true
      )]
    pub encapsulated_data: Account<'info, PermissionData>,

    #[account(
        seeds = [b"delegated_owner", crate::ID.as_ref(), label.as_ref()],
        bump = delegated_owner.bump
      )]
    pub delegated_owner: Account<'info, DelegatedOwner>,

    pub system_program: Program<'info, System>,
}

impl<'info> AcceptOwnership<'info> {
    pub fn accept_ownership(&mut self, _label: String) -> Result<()> {
        let encapsulated_data = &mut self.encapsulated_data;

        // check if time is reached
        let current_time = Clock::get().unwrap().unix_timestamp as u64;
        if self.delegated_owner.ownership_time > current_time {
            return Err(error!(ErrorCode::TimeNotReached));
        }

        // check if the signer is the delegated owner
        if self.signer.key() != self.delegated_owner.new_owner {
            return Err(error!(ErrorCode::Unauthorized));
        }

        let old_owner = encapsulated_data.owner;
        encapsulated_data.owner = self.delegated_owner.new_owner;
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
            .find(|p| p.wallet == self.delegated_owner.new_owner)
        {
            new_owner_permission.role = Role::Owner;
        } else {
            // Add the new owner's permission to the permission list
            encapsulated_data.permissions.push(Permission {
                role: Role::Owner,
                wallet: self.delegated_owner.new_owner,
                start_time: 0,
                end_time: 0,
            });
        }

        Ok(())
    }
}
