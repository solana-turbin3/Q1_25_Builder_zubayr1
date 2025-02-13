use crate::error_state::ErrorCode;
use crate::state::*;
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(label: String)]
pub struct AddPermission<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    pub creator: SystemAccount<'info>,

    #[account(
      mut,
      seeds = [b"permissions", creator.key().as_ref(), label.as_ref()],
      bump = encapsulated_data.bump,
      realloc = 8 + PermissionData::INIT_SPACE,
      realloc::payer = payer,
      realloc::zero = true
    )]
    pub encapsulated_data: Account<'info, PermissionData>,

    pub permitted_wallet: SystemAccount<'info>,

    pub system_program: Program<'info, System>,
}

impl<'info> AddPermission<'info> {
    pub fn add_permission(
        &mut self,
        _label: String,
        role_index: u64,
        start_time: u64,
        end_time: u64,
    ) -> Result<()> {
        let encapsulated_data = &mut self.encapsulated_data;

        let role = match role_index {
            2 => Role::Admin,
            3 => Role::FullAccess,
            4 => Role::TimeLimited,
            _ => return Err(error!(ErrorCode::BadRole)),
        };

        // Check if the payer exists. If not, return an error
        if !encapsulated_data
            .permissions
            .iter()
            .any(|p| p.wallet == self.payer.key())
        {
            return Err(error!(ErrorCode::Unauthorized));
        }

        let mut permission_type: u8 = 1;

        // Check if the payer has the full access or time limited access. If so, return an error.
        // If the payer has the admin access, set the permission_type to 2
        if let Some(permission) = encapsulated_data
            .permissions
            .iter_mut()
            .find(|p| p.wallet == self.payer.key())
        {
            if permission.role == Role::FullAccess || permission.role == Role::TimeLimited {
                return Err(ErrorCode::Unauthorized.into());
            }
            if permission.role == Role::Admin {
                permission_type = 2;
            }
        }

        let permitted_wallet = self.permitted_wallet.key();

        // If payer is admin, payer can't demote another admin to full access or time limited
        // Else (providing wallet already exists), update the permission
        // Else (providing wallet doesn't exist), add the permission
        if let Some(permission) = encapsulated_data
            .permissions
            .iter_mut()
            .find(|p| p.wallet == permitted_wallet)
        {
            if permission_type == 2
                && permission.role == Role::Admin
                && (role == Role::FullAccess || role == Role::TimeLimited)
            {
                return Err(ErrorCode::Unauthorized.into());
            }

            // extra check for time limited permission
            if role == Role::TimeLimited {
                if start_time >= end_time {
                    return Err(ErrorCode::InvalidTime.into());
                }

                permission.start_time = start_time;
                permission.end_time = end_time;
            } else {
                permission.start_time = 0;
                permission.end_time = 0;
            }

            permission.role = role;
        } else {
            // extra check for time limited permission
            if role == Role::TimeLimited {
                if start_time >= end_time {
                    return Err(ErrorCode::InvalidTime.into());
                }

                encapsulated_data.permissions.push(Permission {
                    role: role,
                    wallet: permitted_wallet,
                    start_time: start_time,
                    end_time: end_time,
                });
            } else {
                encapsulated_data.permissions.push(Permission {
                    role: role,
                    wallet: permitted_wallet,
                    start_time: 0,
                    end_time: 0,
                });
            }
        }

        Ok(())
    }
}
