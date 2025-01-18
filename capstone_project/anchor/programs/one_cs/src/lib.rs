#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF");

#[program]
pub mod one_cs {
    use super::*;

    /// Encapsulate the data and create a new permission data account
    pub fn encapsulate(ctx: Context<Encapsulate>, label: String, data: String) -> Result<()> {
        let encapsulated_data = &mut ctx.accounts.encapsulated_data;
        encapsulated_data.owner = ctx.accounts.owner.key();
        encapsulated_data.label = label;
        encapsulated_data.data = data;
        encapsulated_data.permissions.push(Permission {
          role: Role::Owner,
          wallet: ctx.accounts.owner.key(),
          start_time: 0,
          end_time: 0,
        });
        Ok(())
    }

    /// Add a new permission to the permission list
    pub fn add_permission(ctx: Context<AddPermission>, _label: String, role_index: u64, start_time: u64, end_time: u64 ) -> Result<()> {
      let encapsulated_data = &mut ctx.accounts.encapsulated_data;

      let role = match role_index {
        2 => Role::Admin,
        3 => Role::FullAccess,
        4 => Role::TimeLimited,
        _ => return Err(ErrorCode::BadRole.into()),
      };

      // Check if the payer exists. If not, return an error
      if !encapsulated_data.permissions.iter().any(|p| p.wallet == ctx.accounts.payer.key()) {
        return Err(ErrorCode::Unauthorized.into());
      }

      let mut permission_type: u8 = 1;
      
      // Check if the payer has the full access or time limited access. If so, return an error.
      // If the payer has the admin access, set the permission_type to 2
      if let Some(permission) = encapsulated_data.permissions.iter_mut().find(|p| p.wallet ==  ctx.accounts.payer.key()) {
        if permission.role == Role::FullAccess || permission.role == Role::TimeLimited {
          return Err(ErrorCode::Unauthorized.into());
        }
        if permission.role == Role::Admin {
          permission_type = 2;
        }
      }

      let permitted_wallet = ctx.accounts.permitted_wallet.key();

      // If payer is admin, payer can't demote another admin to full access or time limited
      // Else (providing wallet already exists), update the permission
      // Else (providing wallet doesn't exist), add the permission
      if let Some(permission) = encapsulated_data.permissions.iter_mut().find(|p| p.wallet == permitted_wallet) {
        if permission_type == 2 && permission.role == Role::Admin && 
          (role == Role::FullAccess || role == Role::TimeLimited) {
            return Err(ErrorCode::Unauthorized.into());
        }

        // extra check for time limited permission
        if role == Role::TimeLimited {
          if start_time >= end_time {
            return Err(ErrorCode::InvalidTime.into());
          }

          permission.start_time = start_time;
          permission.end_time = end_time;
        } else {
          permission.start_time = 0;
          permission.end_time = 0;
        }
        
        permission.role = role;
      } else {
        // extra check for time limited permission
        if role == Role::TimeLimited {
          if start_time >= end_time {
            return Err(ErrorCode::InvalidTime.into());
          }

          encapsulated_data.permissions.push(Permission {
            role: role,
            wallet: permitted_wallet,
            start_time: start_time,
            end_time: end_time,
          });
        } else {
          encapsulated_data.permissions.push(Permission {
            role: role,
            wallet: permitted_wallet,
            start_time: 0,
            end_time: 0,
          });
        }
      }
      
      Ok(())
    }

    // pub fn remove_permission(ctx: Context<RemovePermission>, _label: String) -> Result<()> {
    //   let encapsulated_data = &mut ctx.accounts.encapsulated_data;

    //   if !encapsulated_data.permissions.iter().any(|p| p.wallet == ctx.accounts.payer.key()) {
    //     return Err(ErrorCode::Unauthorized.into());
    //   }

    //   let mut permission_type: u8 = 1;
      
    //   if let Some(permission) = encapsulated_data.permissions.iter_mut().find(|p| p.wallet ==  ctx.accounts.payer.key()) {
    //     if permission.role == Role::FullAccess {
    //       return Err(ErrorCode::Unauthorized.into());
    //     }
    //     if permission.role == Role::Admin {
    //       permission_type = 2;
    //     }
    //   }

    //   let permitted_wallet = ctx.accounts.permitted_wallet.key();

    //   if let Some(permission) = encapsulated_data.permissions.iter_mut().find(|p| p.wallet == permitted_wallet) {
    //     if permission_type == 2 && permission.role == Role::Admin {
    //       return Err(ErrorCode::Unauthorized.into());
    //     }
    //   }

    //   encapsulated_data.permissions.retain(|p| p.wallet != permitted_wallet);
    //   Ok(())
    // }

    // pub fn edit_data(ctx: Context<EditData>, _label: String, data: String) -> Result<()> {
    //   let encapsulated_data = &mut ctx.accounts.encapsulated_data;

    //   if !encapsulated_data.permissions.iter().any(|p| p.wallet == ctx.accounts.payer.key()) {
    //     return Err(ErrorCode::Unauthorized.into());
    //   }

    //   encapsulated_data.data = data;
    //   Ok(())
    // }

    // pub fn transfer_ownership(ctx: Context<TransferOwnership>, _label: String, new_owner: Pubkey) -> Result<()> {
    //   let encapsulated_data = &mut ctx.accounts.encapsulated_data;

    //   let old_owner = encapsulated_data.owner;
    //   encapsulated_data.owner = new_owner;

    //   if let Some(old_owner_permission) = encapsulated_data
    //     .permissions
    //     .iter_mut()
    //     .find(|p| p.wallet == old_owner)
    //     {
    //         old_owner_permission.role = Role::Admin;
    //     }

    //   if let Some(new_owner_permission) = encapsulated_data
    //     .permissions
    //     .iter_mut()
    //     .find(|p| p.wallet == new_owner)
    //   {
    //       new_owner_permission.role = Role::Owner;
    //   } else {
    //       encapsulated_data.permissions.push(Permission {
    //           role: Role::Owner,
    //           wallet: new_owner,
    //       });
    //   }

    //   Ok(())
    // }
}

#[derive(InitSpace)]
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum Role {
    Owner = 1,       // Owner: the creator of the permission data account
    Admin = 2,       // Admin: Owner, can add/remove permissions
    FullAccess = 3,  // FullAccess: Can access the encapsulated data
    TimeLimited = 4, // TimeLimited: Can access the encapsulated data for a limited time
}

#[derive(InitSpace)]
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub struct Permission {
    pub role: Role,
    pub wallet: Pubkey,
    pub start_time: u64,
    pub end_time: u64,
}

#[account]
#[derive(InitSpace)]
pub struct PermissionData {
    pub owner: Pubkey,
    #[max_len(32)]
    pub label: String,
    #[max_len(256)]
    pub data: String,
    #[max_len(5, 100)]
    pub permissions: Vec<Permission>,
}

#[derive(Accounts)]
#[instruction(label: String)]
pub struct Encapsulate<'info> {
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

#[derive(Accounts)]
#[instruction(label: String)]
pub struct AddPermission<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
      mut, 
      seeds = [b"permissions", crate::ID.as_ref(), label.as_ref()], 
      bump,
      realloc = 8 + PermissionData::INIT_SPACE,
      realloc::payer = payer,
      realloc::zero = true
    )]
    pub encapsulated_data: Account<'info, PermissionData>,

    /// CHECK: This field is not an account; it represents a wallet's public key.
    pub permitted_wallet: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(label: String)]
pub struct RemovePermission<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
      mut, 
      seeds = [b"permissions", crate::ID.as_ref(), label.as_ref()], 
      bump,
      realloc = 8 + PermissionData::INIT_SPACE,
      realloc::payer = payer,
      realloc::zero = true
    )]
    pub encapsulated_data: Account<'info, PermissionData>,

    /// CHECK: This field is not an account; it represents a wallet's public key.
    pub permitted_wallet: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(label: String)]
pub struct EditData<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
      mut, 
      seeds = [b"permissions", crate::ID.as_ref(), label.as_ref()], 
      bump,
      realloc = 8 + PermissionData::INIT_SPACE,
      realloc::payer = payer,
      realloc::zero = true
    )]
    pub encapsulated_data: Account<'info, PermissionData>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(label: String)]
pub struct TransferOwnership<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
      mut, 
      seeds = [b"permissions", crate::ID.as_ref(), label.as_ref()], 
      bump,
      realloc = 8 + PermissionData::INIT_SPACE,
      realloc::payer = owner,
      realloc::zero = true
    )]
    pub encapsulated_data: Account<'info, PermissionData>,

    pub system_program: Program<'info, System>,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Unauthorized publickey")]
    Unauthorized,

    #[msg("Bad role")]
    BadRole,

    #[msg("Invalid time")]
    InvalidTime,
}