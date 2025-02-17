use crate::error_state::ErrorCode;
use crate::state::*;
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(label: String)]
pub struct AcceptOwnership<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    pub creator: SystemAccount<'info>,

    #[account(
        mut,
        seeds = [b"permissions", creator.key().as_ref(), label.as_ref()],
        bump = encapsulated_data.bump
      )]
    pub encapsulated_data: Account<'info, PermissionData>,

    #[account(
        mut,
        seeds = [b"permissioned_wallet".as_ref(), encapsulated_data.owner.as_ref(), label.as_ref()],
        bump = owner_permissioned_wallet.bump,
        constraint = owner_permissioned_wallet.main_data_pda == encapsulated_data.key()
            @ ErrorCode::Unauthorized
    )]
    pub owner_permissioned_wallet: Account<'info, PermissionedWallet>,

    #[account(
        init_if_needed,
        payer = signer,
        space = 8 + PermissionedWallet::INIT_SPACE,
        seeds = [b"permissioned_wallet".as_ref(), signer.key().as_ref(), label.as_ref()],
        bump,
    )]
    pub new_owner_permissioned_wallet: Account<'info, PermissionedWallet>,

    #[account(
        seeds = [b"delegated_owner", creator.key().as_ref(), label.as_ref()],
        bump = delegated_owner.bump
      )]
    pub delegated_owner: Account<'info, DelegatedOwner>,

    pub system_program: Program<'info, System>,
}

impl<'info> AcceptOwnership<'info> {
    pub fn accept_ownership(&mut self, _label: String, bumps: &AcceptOwnershipBumps) -> Result<()> {
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

        // update the owner
        encapsulated_data.owner = self.delegated_owner.new_owner;

        // Update the old owner's permission to admin
        self.owner_permissioned_wallet.role = Role::Admin;

        // Update the new owner's permission to owner
        self.new_owner_permissioned_wallet
            .set_inner(PermissionedWallet {
                role: Role::Owner,
                main_data_pda: encapsulated_data.key(),
                bump: bumps.new_owner_permissioned_wallet,
                wallet: self.delegated_owner.new_owner,
                start_time: 0,
                end_time: 0,
            });

        Ok(())
    }
}
