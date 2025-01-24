use crate::error_state::ErrorCode;
use crate::state::*;
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(label: String)]
pub struct EditData<'info> {
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

    pub system_program: Program<'info, System>,
}

impl<'info> EditData<'info> {
    pub fn edit_data(&mut self, _label: String, data: String) -> Result<()> {
        let encapsulated_data = &mut self.encapsulated_data;

        if !encapsulated_data
            .permissions
            .iter()
            .any(|p| p.wallet == self.payer.key())
        {
            return Err(error!(ErrorCode::Unauthorized));
        }

        if let Some(permission) = encapsulated_data
            .permissions
            .iter_mut()
            .find(|p| p.wallet == self.payer.key())
        {
            if permission.role == Role::TimeLimited {
                let current_time = Clock::get()?.unix_timestamp as u64;
                if current_time < permission.start_time || current_time > permission.end_time {
                    return Err(error!(ErrorCode::InvalidTime));
                }
            }
        }

        encapsulated_data.data = data;
        Ok(())
    }
}
