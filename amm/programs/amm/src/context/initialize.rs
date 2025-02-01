use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{Mint, TokenAccount};

use crate::state::Config;

#[derive(Accounts)]
#[instruction(seeds: u64)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub initializer: Signer<'info>,
    pub mint_x: Account<'info, Mint>,
    pub mint_y: Account<'info, Mint>,

    #[account(
        init,
        payer = initializer,
        mint::mint_authority = config,
        mint::decimals = 6,
        seeds = ["lp".as_bytes(), config.key().as_ref()],
        bump
    )]
    pub mint_lp: Account<'info, Mint>,

    #[account(
        init,
        payer = initializer,
        associated_token::mint = mint_x,
        associated_token::authority = config,
    )]
    pub vault_x: Account<'info, TokenAccount>,

    #[account(
        init,
        payer = initializer,
        associated_token::mint = mint_y,
        associated_token::authority = config,
    )]
    pub vault_y: Account<'info, TokenAccount>,

    #[account(
        init,
        payer = initializer,
        space = 8 + Config::INIT_SPACE,
        seeds = [b"config", seeds.to_le_bytes().as_ref()],
        bump
    )]
    pub config: Account<'info, Config>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

impl<'info> Initialize<'info> {
    pub fn initialize(
        &mut self,
        seeds: u64,
        fee: u16,
        authority: Option<Pubkey>,
        bumps: &InitializeBumps,
    ) -> Result<()> {
        self.config.set_inner(Config {
            authority,
            seed: seeds,
            fee,
            mint_x: self.mint_x.key(),
            mint_y: self.mint_y.key(),
            locked: false,
            config_bump: bumps.config,
            lp_bump: bumps.mint_lp,
        });

        Ok(())
    }
}
