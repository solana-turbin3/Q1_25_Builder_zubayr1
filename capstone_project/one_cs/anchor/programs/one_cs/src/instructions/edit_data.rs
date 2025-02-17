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
pub struct EditTextData<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    pub creator: SystemAccount<'info>,

    #[account(
      mut,
      seeds = [b"permissions", creator.key().as_ref(), label.as_ref()],
      bump = encapsulated_data.bump,
      realloc = 8 + PermissionData::INIT_SPACE,
      realloc::payer = payer,
      realloc::zero = true
    )]
    pub encapsulated_data: Account<'info, PermissionData>,

    #[account(
        seeds = [b"permissioned_wallet".as_ref(), payer.key().as_ref(), label.as_ref()],
        bump = payer_permissioned_wallet.bump,
        constraint = payer_permissioned_wallet.main_data_pda == encapsulated_data.key()
            @ ErrorCode::Unauthorized
    )]
    pub payer_permissioned_wallet: Account<'info, PermissionedWallet>,

    pub system_program: Program<'info, System>,
}

impl<'info> EditTextData<'info> {
    pub fn edit_text_data(&mut self, _label: String, data: String) -> Result<()> {
        let encapsulated_data = &mut self.encapsulated_data;

        // Check if time limited and if so, check if the current time is between the start and end time
        if self.payer_permissioned_wallet.role == Role::TimeLimited {
            let current_time = Clock::get()?.unix_timestamp as u64;
            if current_time < self.payer_permissioned_wallet.start_time
                || current_time > self.payer_permissioned_wallet.end_time
            {
                return Err(error!(ErrorCode::Unauthorized));
            }
        }

        encapsulated_data.data = EncapsulatedData {
            text: Some(data),
            token: None,
        };
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(label: String)]
pub struct EditTokenData<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    pub creator: SystemAccount<'info>,

    pub taker: SystemAccount<'info>,

    pub owner: SystemAccount<'info>,

    pub token_mint: InterfaceAccount<'info, Mint>,

    #[account(
        mut,
        has_one = token_mint,
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

    #[account(
        mut,
        associated_token::mint = token_mint,
        associated_token::authority = payer,
    )]
    pub payer_ata: InterfaceAccount<'info, TokenAccount>,

    #[account(
        mut,
        associated_token::mint = token_mint,
        associated_token::authority = taker,
    )]
    pub taker_ata: InterfaceAccount<'info, TokenAccount>,

    #[account(
        mut,
        associated_token::mint = token_mint,
        associated_token::authority = owner,
    )]
    pub owner_ata: InterfaceAccount<'info, TokenAccount>,

    #[account(
        seeds = [b"permissioned_wallet".as_ref(), payer.key().as_ref(), label.as_ref()],
        bump = payer_permissioned_wallet.bump,
        constraint = payer_permissioned_wallet.main_data_pda == encapsulated_data.key()
            @ ErrorCode::Unauthorized
    )]
    pub payer_permissioned_wallet: Account<'info, PermissionedWallet>,

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

impl<'info> EditTokenData<'info> {
    pub fn edit_token_data(&mut self, label: String, amount: u64, is_deposit: bool) -> Result<()> {
        // Check if time limited and if so, check if the current time is between the start and end time
        if self.payer_permissioned_wallet.role == Role::TimeLimited {
            let current_time = Clock::get()?.unix_timestamp as u64;
            if current_time < self.payer_permissioned_wallet.start_time
                || current_time > self.payer_permissioned_wallet.end_time
            {
                return Err(error!(ErrorCode::Unauthorized));
            }
        }

        if is_deposit {
            self.deposit_token_data(label, amount)?;
        } else {
            self.withdraw_token_data(label, amount)?;
        }

        Ok(())
    }

    fn deposit_token_data(&mut self, label: String, amount: u64) -> Result<()> {
        let encapsulated_data = &mut self.encapsulated_data;

        let cpi_program = self.token_program.to_account_info();

        let cpi_accounts = TransferChecked {
            from: self.payer_ata.to_account_info(),
            to: self.vault.to_account_info(),
            mint: self.token_mint.to_account_info(),
            authority: self.payer.to_account_info(),
        };

        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

        transfer_checked(cpi_ctx, amount, self.token_mint.decimals)?;

        encapsulated_data.data = EncapsulatedData {
            text: None,

            token: Some(TokenData {
                token_mint: self.token_mint.key(),
                token_amount: encapsulated_data
                    .data
                    .token
                    .as_ref()
                    .unwrap()
                    .token_amount
                    .checked_add(amount)
                    .ok_or(error!(ErrorCode::AmountTooLarge))?,
            }),
        };

        Ok(())
    }

    fn withdraw_token_data(&mut self, label: String, amount: u64) -> Result<()> {
        let encapsulated_data = &mut self.encapsulated_data;

        let cpi_program = self.token_program.to_account_info();

        let cpi_accounts = TransferChecked {
            from: self.vault.to_account_info(),
            to: self.taker_ata.to_account_info(),
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
        transfer_checked(cpi_ctx, amount, self.token_mint.decimals)?;

        if amount == encapsulated_data.data.token.as_ref().unwrap().token_amount {
            self.close_escrow(label)?;
        } else {
            encapsulated_data.data = EncapsulatedData {
                text: None,

                token: Some(TokenData {
                    token_mint: self.token_mint.key(),
                    token_amount: encapsulated_data
                        .data
                        .token
                        .as_ref()
                        .unwrap()
                        .token_amount
                        .checked_sub(amount)
                        .ok_or(error!(ErrorCode::AmountTooLarge))?,
                }),
            };
        }

        Ok(())
    }

    fn close_escrow(&mut self, label: String) -> Result<()> {
        let cpi_program = self.token_program.to_account_info();

        let cpi_accounts = CloseAccount {
            account: self.vault.to_account_info(),
            destination: self.owner.to_account_info(),
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
