use crate::state::*;
use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface};

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

    #[account(
      init,
      payer = creator,
      space = 8 + PermissionedWallet::INIT_SPACE,
      seeds = [b"permissioned_wallet".as_ref(), creator.key().as_ref(), label.as_ref()],
      bump
    )]
    pub permissioned_wallet: Account<'info, PermissionedWallet>,

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
            bump: bumps.encapsulated_data,
        });

        self.permissioned_wallet.set_inner(PermissionedWallet {
            main_data_pda: self.encapsulated_data.key(),
            role: Role::Owner,
            wallet: self.creator.key(),
            start_time: 0,
            end_time: 0,
            bump: bumps.permissioned_wallet,
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

    #[account(
        init,
        payer = creator,
        space = 8 + PermissionedWallet::INIT_SPACE,
        seeds = [b"permissioned_wallet".as_ref(), creator.key().as_ref(), label.as_ref()],
        bump
      )]
    pub permissioned_wallet: Account<'info, PermissionedWallet>,

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

            bump: bumps.encapsulated_data,
        });

        self.permissioned_wallet.set_inner(PermissionedWallet {
            main_data_pda: self.encapsulated_data.key(),
            role: Role::Owner,
            wallet: self.creator.key(),
            start_time: 0,
            end_time: 0,
            bump: bumps.permissioned_wallet,
        });

        Ok(())
    }
}
