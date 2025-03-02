use anchor_lang::prelude::*;

mod instructions;
mod states;

use instructions::*;
use states::*;

declare_id!("Hd1G3Newy87gKKbDMx9sHSYH9FnGUewKxxFeEVmxpPxy");

#[program]
pub mod anchor_marketplace {
    use super::*;

    pub fn initialize(ctx: Context<InitializeMarketplace>, name: String, fee: u16) -> Result<()> {
        ctx.accounts.initialize(name, fee, &ctx.bumps)
    }
}
