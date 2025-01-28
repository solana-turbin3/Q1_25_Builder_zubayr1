use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenInterface};

use crate::StakeConfig;

#[derive(Accounts)]
pub struct InitializeConfig<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        init,
        payer = admin,
        space = 8 + StakeConfig::INIT_SPACE,
        seeds = [b"config"],
        bump
    )]
    pub config_account: Account<'info, StakeConfig>,

    #[account(
        init,
        payer = admin,
        seeds = [b"rewards".as_ref(), config_account.key().as_ref()],
        bump,
        mint::decimals = 6,
        mint::authority = config_account,
    )]
    pub rewards_mint: Account<'info, Mint>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, TokenInterface>,
}

impl<'info> InitializeConfig<'info> {
    pub fn initialize_config(&mut self, points_per_stake: u8, max_stake: u8, freeze_period: u32, bump: &InitializeConfigBumps) -> Result<()> {
        self.config_account.set_inner(StakeConfig {
            bump: bump.config_account,
            rewards_bump: bump.rewards_mint,
            points_per_stake,
            max_stake,
            freeze_period,
        });

        Ok(())
    }
}
