use anchor_lang::prelude::*;

declare_id!("6VwVWEiocY8N8qMY4oe6tcbZPVnxxFvWTpZBLEvW9mSX");

#[program]
pub mod anchor_marketplace {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
