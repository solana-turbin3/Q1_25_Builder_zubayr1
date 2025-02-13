use crate::error_state::ErrorCode;
use crate::state::*;
use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token_interface::{
    close_account, transfer_checked, CloseAccount, Mint, TokenAccount, TokenInterface,
    TransferChecked,
};

#[derive(Accounts)]
#[instruction(label: String)]
pub struct CloseEscrowManually<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    pub creator: SystemAccount<'info>,

    pub token_mint: InterfaceAccount<'info, Mint>,

    #[account(
        mut,
        has_one = token_mint,
        seeds = [b"escrow", creator.key().as_ref(), label.as_ref()],
        bump = escrow.bump,
        close = payer
      )]
    pub escrow: Account<'info, Escrow>,

    #[account(
        mut,
        associated_token::mint = token_mint,
        associated_token::authority = escrow,
      )]
    pub vault: InterfaceAccount<'info, TokenAccount>,

    #[account(
        mut,
        associated_token::mint = token_mint,
        associated_token::authority = payer,
    )]
    pub payer_ata: InterfaceAccount<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [b"permissions", creator.key().as_ref(), label.as_ref()],
        bump = encapsulated_data.bump,
        realloc = 8 + PermissionData::INIT_SPACE,
        realloc::payer = payer,
        realloc::zero = true
      )]
    pub encapsulated_data: Account<'info, PermissionData>,

    pub system_program: Program<'info, System>,
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

impl<'info> CloseEscrowManually<'info> {
    pub fn close_escrow_manually(&mut self, label: String) -> Result<()> {
        let encapsulated_data = &mut self.encapsulated_data;

        if self.payer.key() != encapsulated_data.owner {
            return Err(error!(ErrorCode::Unauthorized));
        }

        // First transfer any remaining tokens
        if self.vault.amount > 0 {
            let cpi_program = self.token_program.to_account_info();

            let cpi_accounts = TransferChecked {
                from: self.vault.to_account_info(),
                to: self.payer_ata.to_account_info(),
                mint: self.token_mint.to_account_info(),
                authority: self.escrow.to_account_info(),
            };

            let seeds = &[
                b"escrow",
                self.creator.key.as_ref(),
                label.as_ref(),
                &[self.escrow.bump],
            ];
            let signer_seeds = &[&seeds[..]];

            let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);
            transfer_checked(cpi_ctx, self.vault.amount, self.token_mint.decimals)?;
        }

        // Close the account
        let cpi_program = self.token_program.to_account_info();

        let cpi_accounts = CloseAccount {
            account: self.vault.to_account_info(),
            destination: self.payer.to_account_info(),
            authority: self.escrow.to_account_info(),
        };

        let seeds = &[
            b"escrow",
            self.creator.key.as_ref(),
            label.as_ref(),
            &[self.escrow.bump],
        ];
        let signer_seeds = &[&seeds[..]];

        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);

        close_account(cpi_ctx)?;

        self.empty_encapsulated_data()?;

        Ok(())
    }

    fn empty_encapsulated_data(&mut self) -> Result<()> {
        self.encapsulated_data.data = EncapsulatedData {
            text: None,
            token: None,
        };
        Ok(())
    }
}
