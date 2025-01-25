use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Unauthorized publickey")]
    Unauthorized,

    #[msg("Bad role")]
    BadRole,

    #[msg("Invalid time")]
    InvalidTime,

    #[msg("Time not reached")]
    TimeNotReached,
}
