#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF");

#[program]
pub mod one_cs {
    use super::*;

  pub fn close(_ctx: Context<CloseOneCs>) -> Result<()> {
    Ok(())
  }

  pub fn decrement(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.one_cs.count = ctx.accounts.one_cs.count.checked_sub(1).unwrap();
    Ok(())
  }

  pub fn increment(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.one_cs.count = ctx.accounts.one_cs.count.checked_add(1).unwrap();
    Ok(())
  }

  pub fn initialize(_ctx: Context<InitializeOneCs>) -> Result<()> {
    Ok(())
  }

  pub fn set(ctx: Context<Update>, value: u8) -> Result<()> {
    ctx.accounts.one_cs.count = value.clone();
    Ok(())
  }
}

#[derive(Accounts)]
pub struct InitializeOneCs<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  init,
  space = 8 + OneCs::INIT_SPACE,
  payer = payer
  )]
  pub one_cs: Account<'info, OneCs>,
  pub system_program: Program<'info, System>,
}
#[derive(Accounts)]
pub struct CloseOneCs<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  mut,
  close = payer, // close account and return lamports to payer
  )]
  pub one_cs: Account<'info, OneCs>,
}

#[derive(Accounts)]
pub struct Update<'info> {
  #[account(mut)]
  pub one_cs: Account<'info, OneCs>,
}

#[account]
#[derive(InitSpace)]
pub struct OneCs {
  count: u8,
}
