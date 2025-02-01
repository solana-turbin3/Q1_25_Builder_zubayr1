use anchor_lang::prelude::*;

mod context;
mod state;

use context::*;
use state::*;

declare_id!("uohZ2WSxCzjSPtJsQCaeGnLZneTezZbEygGvBYdkwfb");

#[program]
pub mod amm {
    use super::*;

    pub fn initialize(
        seeds: u64,
        fee: u16,
        authority: Option<Pubkey>,
        ctx: Context<Initialize>,
    ) -> Result<()> {
        ctx.accounts.initialize(seeds, fee, authority, &ctx.bumps)
    }
}
