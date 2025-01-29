use crate::error_state::ErrorCode;
use crate::state::*;
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(label: String)]
pub struct RemovePermission<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
      mut,
      seeds = [b"permissions", crate::ID.as_ref(), label.as_ref()],
      bump = encapsulated_data.bump,
      realloc = 8 + PermissionData::INIT_SPACE,
      realloc::payer = payer,
      realloc::zero = true
    )]
    pub encapsulated_data: Account<'info, PermissionData>,

    pub permitted_wallet: SystemAccount<'info>,

    pub system_program: Program<'info, System>,
}

impl<'info> RemovePermission<'info> {
    pub fn remove_permission(&mut self, _label: String) -> Result<()> {
        let encapsulated_data = &mut self.encapsulated_data;

        if !encapsulated_data
            .permissions
            .iter()
            .any(|p| p.wallet == self.payer.key())
        {
            return Err(error!(ErrorCode::Unauthorized));
        }

        let mut permission_type: u8 = 1;

        if let Some(permission) = encapsulated_data
            .permissions
            .iter_mut()
            .find(|p| p.wallet == self.payer.key())
        {
            if permission.role == Role::FullAccess || permission.role == Role::TimeLimited {
                return Err(error!(ErrorCode::Unauthorized));
            }
            if permission.role == Role::Admin {
                permission_type = 2;
            }
        }

        let permitted_wallet = self.permitted_wallet.key();

        if let Some(permission) = encapsulated_data
            .permissions
            .iter_mut()
            .find(|p| p.wallet == permitted_wallet)
        {
            if permission_type == 2 && permission.role == Role::Admin {
                return Err(error!(ErrorCode::Unauthorized));
            }
        }

        encapsulated_data
            .permissions
            .retain(|p| p.wallet != permitted_wallet);

        Ok(())
    }
}
