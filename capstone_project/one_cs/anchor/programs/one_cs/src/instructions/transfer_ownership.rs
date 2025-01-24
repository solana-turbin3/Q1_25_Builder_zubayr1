use crate::state::*;
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(label: String)]
pub struct TransferOwnership<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
      mut,
      seeds = [b"permissions", crate::ID.as_ref(), label.as_ref()],
      bump = encapsulated_data.bump,
      realloc = 8 + PermissionData::INIT_SPACE,
      realloc::payer = owner,
      realloc::zero = true
    )]
    pub encapsulated_data: Account<'info, PermissionData>,

    pub system_program: Program<'info, System>,
}

impl<'info> TransferOwnership<'info> {
    pub fn transfer_ownership(&mut self, _label: String, new_owner: Pubkey) -> Result<()> {
        let encapsulated_data = &mut self.encapsulated_data;

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
        Ok(())
    }
}
