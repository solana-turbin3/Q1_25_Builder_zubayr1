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
    pub owner: Signer<'info>,

    #[account(
      init,
      payer = owner,
      space = 8 + PermissionData::INIT_SPACE,
      seeds = [b"permissions".as_ref(), crate::ID.as_ref(), label.as_ref()],
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
            owner: self.owner.key(),
            label,
            data: EncapsulatedData {
                text: Some(data),
                token: None,
            },
            permissions: vec![Permission {
                role: Role::Owner,
                wallet: self.owner.key(),
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
    pub owner: Signer<'info>,

    #[account(mut)]
    pub token_mint: InterfaceAccount<'info, Mint>,

    #[account(
      init_if_needed,
      payer = owner,
      associated_token::mint = token_mint,
      associated_token::authority = owner,
    )]
    pub owner_ata: InterfaceAccount<'info, TokenAccount>,

    #[account(
      seeds = [b"escrow", crate::ID.as_ref(), label.as_ref()],
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
      payer = owner,
      space = 8 + PermissionData::INIT_SPACE,
      seeds = [b"permissions".as_ref(), crate::ID.as_ref(), label.as_ref()],
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
            owner: self.owner.key(),
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
                wallet: self.owner.key(),
                start_time: 0,
                end_time: 0,
            }],
            bump: bumps.encapsulated_data,
        });

        Ok(())
    }
}
