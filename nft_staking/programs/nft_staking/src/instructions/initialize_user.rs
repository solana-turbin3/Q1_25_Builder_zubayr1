use anchor_lang::prelude::*;

use crate::UserAccount;

#[derive(Accounts)]
pub struct InitializeUser<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        init,
        payer = user,
        space = 8 + UserAccount::INIT_SPACE,
        seeds = [b"user", user.key().as_ref()],
        bump
    )]
    pub user_account: Account<'info, UserAccount>,

    pub system_program: Program<'info, System>,
}

impl<'info> InitializeUser<'info> {
    pub fn initialize_user_account(&mut self, bump: &InitializeUserBumps) -> Result<()> {
        self.user_account.set_inner(UserAccount {
            bump: bump.user_account,
            points: 0,
            amounts_staked: 0,
        });

        Ok(())
    }
}
