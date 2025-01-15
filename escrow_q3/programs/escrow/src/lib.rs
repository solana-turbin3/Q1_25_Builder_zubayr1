use anchor_lang::prelude::*;

pub mod instructions;
pub use instructions::*;

pub mod state;
pub use state::*;

declare_id!("3H54HvV8iDVakQyMnXHN88DThgWJfYvUTCYvZu4fstoD");

#[program]
pub mod escrow {
    use super::*;

    pub fn make(ctx: Context<Make>, seed: u64, receive: u64, deposit: u64) -> Result<()> {
        ctx.accounts.init_escrow(seed, receive, &ctx.bumps)?;

        ctx.accounts.deposit(deposit)?;

        Ok(())
    }
}
