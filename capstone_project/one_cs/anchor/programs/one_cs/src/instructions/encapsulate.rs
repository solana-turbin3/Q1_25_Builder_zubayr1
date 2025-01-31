use crate::state::*;
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(label: String)]
pub struct EncapsulateText<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
      init,
      payer = owner,
      space = 8 + PermissionData::INIT_SPACE,
      seeds = [b"permissions".as_ref(), crate::ID.as_ref(), label.as_ref()],
      bump
    )]
    pub encapsulated_data: Account<'info, PermissionData>,

    pub system_program: Program<'info, System>,
}

impl<'info> EncapsulateText<'info> {
    pub fn encapsulate_text(
        &mut self,
        bumps: &EncapsulateTextBumps,
        label: String,
        data: String,
    ) -> Result<()> {
        self.encapsulated_data.set_inner(PermissionData {
            owner: self.owner.key(),
            label,
            data: EncapsulatedData {
                text: Some(data),
                token: None,
            },
            permissions: vec![Permission {
                role: Role::Owner,
                wallet: self.owner.key(),
                start_time: 0,
                end_time: 0,
            }],
            bump: bumps.encapsulated_data,
        });

        Ok(())
    }
}
