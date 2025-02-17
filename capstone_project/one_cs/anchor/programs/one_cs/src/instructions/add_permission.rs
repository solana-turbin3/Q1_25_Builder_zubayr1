use crate::error_state::ErrorCode;
use crate::state::*;
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(label: String)]
pub struct AddPermission<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    pub creator: SystemAccount<'info>,

    pub permitted_wallet: SystemAccount<'info>,

    #[account(
      seeds = [b"permissions", creator.key().as_ref(), label.as_ref()],
      bump = encapsulated_data.bump,
      has_one = creator
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
      init_if_needed,
      payer = payer,
      space = 8 + PermissionedWallet::INIT_SPACE,
      seeds = [b"permissioned_wallet".as_ref(), permitted_wallet.key().as_ref(), label.as_ref()],
      bump
    )]
    pub permissioned_wallet: Account<'info, PermissionedWallet>,

    pub system_program: Program<'info, System>,
}

impl<'info> AddPermission<'info> {
    pub fn add_permission(
        &mut self,
        _label: String,
        role_index: u64,
        start_time: u64,
        end_time: u64,
        bumps: &AddPermissionBumps,
    ) -> Result<()> {
        let role = match role_index {
            2 => Role::Admin,
            3 => Role::FullAccess,
            4 => Role::TimeLimited,
            _ => return Err(error!(ErrorCode::BadRole)),
        };

        // Check if the payer has the full access or time limited access. If so, return an error.
        if self.payer_permissioned_wallet.role == Role::FullAccess
            || self.payer_permissioned_wallet.role == Role::TimeLimited
        {
            return Err(error!(ErrorCode::Unauthorized));
        }

        // If time-limited, check start_time < end_time
        if role == Role::TimeLimited && start_time >= end_time {
            return Err(error!(ErrorCode::InvalidTime));
        }

        // If payer is admin, payer can't demote another admin to full access or time limited
        if !self.permissioned_wallet.to_account_info().data_is_empty() {
            if self.payer_permissioned_wallet.role == Role::Admin
                && self.permissioned_wallet.role == Role::Admin
                && (role == Role::FullAccess || role == Role::TimeLimited)
            {
                return Err(error!(ErrorCode::Unauthorized));
            }
        }

        // Else (providing wallet already exists), update the permission
        // Else (providing wallet doesn't exist), add the permission
        self.permissioned_wallet.set_inner(PermissionedWallet {
            main_data_pda: self.encapsulated_data.key(),
            role: role.clone(),
            wallet: self.permitted_wallet.key(),
            start_time: if role == Role::TimeLimited {
                start_time
            } else {
                0
            },
            end_time: if role == Role::TimeLimited {
                end_time
            } else {
                0
            },
            bump: bumps.permissioned_wallet,
        });

        Ok(())
    }
}
