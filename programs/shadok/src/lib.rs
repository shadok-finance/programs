use std::cmp;
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, MintTo, Token, TokenAccount};
use anchor_lang::solana_program::clock::Clock;


declare_id!("6Q8hrQ4WMAFTNoM6QWq2tp6ePWA8hERbg9R3mjmNa64g");

#[program]
pub mod shadok {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, mint_account_bump: u8) -> ProgramResult {
        ctx.accounts.minter_state_account.bump = mint_account_bump;
        ctx.accounts.minter_state_account.genesis_timestamp = Clock::get()?.unix_timestamp;
        Ok(())
    }

    // the instruction function
    pub fn gulp(ctx: Context<TakeSol>, amount: u64) -> ProgramResult {
        let ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.from.key(),
            &ctx.accounts.gulp_hole.key(),
            amount,
        );

        anchor_lang::solana_program::program::invoke(
            &ix,
            &[ctx.accounts.from.to_account_info(), ctx.accounts.gulp_hole.to_account_info(), ],
        ).unwrap();

        let number_of_seconds = Clock::get()?.unix_timestamp - ctx.accounts.shadok_program_account.genesis_timestamp;
        let seconds_in_a_week = 60*60*24*7;
        let number_of_weeks = number_of_seconds / seconds_in_a_week;

        // numbers are stored on 64 bits integers
        // bitshifting after 63 weeks will introduce overflow
        // we cap the maximum price to the price we get after 63 weeks
        let current_factor = (1 as u64)  << cmp::min(number_of_weeks, 63);

        // SOL is 9 decimals, C999 is 6 decimals, to get 1 SOL = C999 10000, we multiply the amount of C999 by 10
        let c999_amount = (10 * amount) / current_factor;

        // Mint Redeemable to user Redeemable account.
        let seeds = &[b"mint_account".as_ref(), &[ctx.accounts.shadok_program_account.bump]];
        let signer = &[&seeds[..]];

        let cpi_accounts = MintTo {
            mint: ctx.accounts.c999_mint_account.to_account_info(),
            to: ctx.accounts.c999_user_account.to_account_info(),
            authority: ctx.accounts.shadok_program_account.to_account_info(),
        };

        let cpi_program = ctx.accounts.c999_program_id.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);

        token::mint_to(cpi_ctx, c999_amount)?;

        Ok(())
    }
}


#[derive(Accounts)]
#[instruction(mint_account_bump: u8)]
pub struct Initialize<'info> {
    #[account(init, seeds = [b"mint_account".as_ref()], bump = mint_account_bump, payer = user)]
    minter_state_account: Account<'info, MinterStateAccount>,
    user: Signer<'info>,
    system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct TakeSol<'info> {
    #[account(mut)]
    pub from: Signer<'info>,
    #[account(mut)]
    #[account(address = Pubkey::new_from_array([6, 215, 14, 75, 39, 162, 231, 49, 92, 203, 233, 33, 123, 80, 185, 245, 118, 5, 17, 169, 97, 26, 221, 62, 8, 17, 29, 112, 0, 0, 0, 0]))]
    pub gulp_hole: AccountInfo<'info>,
    #[account(mut)]
    pub shadok_program_account: Account<'info, MinterStateAccount>,
    #[account(mut)]
    pub c999_mint_account: Box<Account<'info, Mint>>,
    #[account(mut)]
    pub c999_user_account: Box<Account<'info, TokenAccount>>,
    pub c999_program_id: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[account]
#[derive(Default)]
pub struct MinterStateAccount {
    pub genesis_timestamp: i64,
    pub bump: u8,
}
