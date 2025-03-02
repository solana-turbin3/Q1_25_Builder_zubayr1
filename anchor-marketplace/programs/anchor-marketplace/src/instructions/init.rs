use anchor_lang::prelude::*;

use anchor_spl::token_interface::{Mint, TokenInterface};

use crate::states::Marketplace;

#[derive(Accounts)]
#[instruction(name: String)]
pub struct InitializeMarketplace<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        init,
        payer = admin,
        space = 8 + Marketplace::INIT_SPACE,
        seeds = [b"marketplace".as_ref(), admin.key().as_ref(), name.as_bytes()],
        bump,
    )]
    pub marketplace: Account<'info, Marketplace>,

    #[account(
        seeds = [b"treasury".as_ref(), marketplace.key().as_ref()],
        bump,
    )]
    pub treasury: SystemAccount<'info>,

    #[account(
        init_if_needed,
        payer = admin,
        mint::decimals = 6,
        mint::authority = marketplace,
        seeds = [b"reward".as_ref(), marketplace.key().as_ref()],
        bump,
    )]
    pub rewards_mint: InterfaceAccount<'info, Mint>,

    pub system_program: Program<'info, System>,
    pub token_program: Interface<'info, TokenInterface>,
}

impl<'info> InitializeMarketplace<'info> {
    pub fn initialize(
        &mut self,
        name: String,
        fee: u16,
        bumps: &InitializeMarketplaceBumps,
    ) -> Result<()> {
        self.marketplace.set_inner(Marketplace {
            admin: self.admin.key(),
            fee,
            treasury_bump: bumps.treasury,
            reward_mint_bump: bumps.rewards_mint,
            name,
            bump: bumps.marketplace,
        });
        Ok(())
    }
}
