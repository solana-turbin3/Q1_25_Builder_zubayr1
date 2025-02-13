use crate::state::*;
use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token_interface::{
    transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked,
};

#[derive(Accounts)]
#[instruction(label: String)]
pub struct EncapsulateText<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(
      init,
      payer = creator,
      space = 8 + PermissionData::INIT_SPACE,
      seeds = [b"permissions".as_ref(), creator.key().as_ref(), label.as_ref()],
      bump
    )]
    pub encapsulated_data: Account<'info, PermissionData>,

    pub system_program: Program<'info, System>,
}

impl<'info> EncapsulateText<'info> {
    pub fn encapsulate_text(
        &mut self,
        bumps: &EncapsulateTextBumps,
        label: String,
        data: String,
    ) -> Result<()> {
        self.encapsulated_data.set_inner(PermissionData {
            creator: self.creator.key(),
            owner: self.creator.key(),
            label,
            data: EncapsulatedData {
                text: Some(data),
                token: None,
            },
            permissions: vec![Permission {
                role: Role::Owner,
                wallet: self.creator.key(),
                start_time: 0,
                end_time: 0,
            }],
            bump: bumps.encapsulated_data,
        });

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(label: String)]
pub struct EncapsulateToken<'info> {
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
      seeds = [b"escrow", creator.key().as_ref(), label.as_ref()],
      bump = escrow.bump
    )]
    pub escrow: Account<'info, Escrow>,

    #[account(
      associated_token::mint = token_mint,
      associated_token::authority = escrow,
    )]
    pub vault: InterfaceAccount<'info, TokenAccount>,

    #[account(
      init,
      payer = creator,
      space = 8 + PermissionData::INIT_SPACE,
      seeds = [b"permissions", creator.key().as_ref(), label.as_ref()],
      bump
    )]
    pub encapsulated_data: Account<'info, PermissionData>,

    pub system_program: Program<'info, System>,
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

impl<'info> EncapsulateToken<'info> {
    pub fn encapsulate_token(
        &mut self,
        label: String,
        bumps: &EncapsulateTokenBumps,
    ) -> Result<()> {
        let vault_amount = self.vault.amount;

        self.encapsulated_data.set_inner(PermissionData {
            creator: self.creator.key(),
            owner: self.creator.key(),
            label,
            data: EncapsulatedData {
                text: None,
                token: Some(TokenData {
                    token_mint: self.token_mint.key(),
                    token_amount: vault_amount,
                }),
            },

            permissions: vec![Permission {
                role: Role::Owner,
                wallet: self.creator.key(),
                start_time: 0,
                end_time: 0,
            }],
            bump: bumps.encapsulated_data,
        });

        Ok(())
    }
}
