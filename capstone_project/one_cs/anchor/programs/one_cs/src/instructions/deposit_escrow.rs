use crate::state::*;
use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token_interface::{
    transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked,
};

#[derive(Accounts)]
#[instruction(label: String)]
pub struct DepositEscrow<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(mut)]
    pub token_mint: InterfaceAccount<'info, Mint>,

    #[account(
      init_if_needed,
      payer = creator,
      associated_token::mint = token_mint,
      associated_token::authority = creator,
    )]
    pub creator_ata: InterfaceAccount<'info, TokenAccount>,

    #[account(
      mut,
      seeds = [b"escrow", creator.key().as_ref(), label.as_ref()],
      bump = escrow.bump
    )]
    pub escrow: Account<'info, Escrow>,

    #[account(
      mut,
      associated_token::mint = token_mint,
      associated_token::authority = escrow,
    )]
    pub vault: InterfaceAccount<'info, TokenAccount>,

    pub system_program: Program<'info, System>,
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

impl<'info> DepositEscrow<'info> {
    pub fn deposit_tokens(&mut self, _label: String, amount: u64) -> Result<()> {
        let cpi_program = self.token_program.to_account_info();

        let cpi_accounts = TransferChecked {
            from: self.creator_ata.to_account_info(),
            to: self.vault.to_account_info(),
            mint: self.token_mint.to_account_info(),
            authority: self.creator.to_account_info(),
        };

        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

        transfer_checked(cpi_ctx, amount, self.token_mint.decimals)?;

        Ok(())
    }
}
