#![allow(clippy::result_large_err)]

use {
    anchor_lang::prelude::*,
    anchor_spl::{
        associated_token::AssociatedToken,
        token_interface::{
            self, Mint, TokenAccount, TokenInterface,
            MintTo, TransferChecked,
        },
    },
};

declare_id!("7aZTQdMeajFATgMKS7h7mGWVqh1UaRnWt1Pf8mnvBDkk");

// CREATE TOKEN ACCOUNTS AND INSTRUCTION
#[derive(Accounts)]
pub struct CreateToken<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        init,
        payer = payer,
        mint::decimals = 9,
        mint::authority = payer.key(),
        mint::freeze_authority = payer.key(),
    )]
    pub mint_account: InterfaceAccount<'info, Mint>,

    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

// MINT TOKEN ACCOUNTS AND INSTRUCTION
#[derive(Accounts)]
pub struct MintToken<'info> {
    #[account(mut)]
    pub mint_authority: Signer<'info>,

    pub recipient: SystemAccount<'info>,
    
    #[account(mut)]
    pub mint_account: InterfaceAccount<'info, Mint>,
    
    #[account(
        init_if_needed,
        payer = mint_authority,
        associated_token::mint = mint_account,
        associated_token::authority = recipient,
        associated_token::token_program = token_program,
    )]
    pub associated_token_account: InterfaceAccount<'info, TokenAccount>,

    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

// TRANSFER TOKENS ACCOUNTS AND INSTRUCTION
#[derive(Accounts)]
pub struct TransferTokens<'info> {
    #[account(mut)]
    pub sender: Signer<'info>,
    pub recipient: SystemAccount<'info>,

    pub mint_account: InterfaceAccount<'info, Mint>,
    
    #[account(
        mut,
        associated_token::mint = mint_account,
        associated_token::authority = sender,
        associated_token::token_program = token_program,
    )]
    pub sender_token_account: InterfaceAccount<'info, TokenAccount>,
    
    #[account(
        init_if_needed,
        payer = sender,
        associated_token::mint = mint_account,
        associated_token::authority = recipient,
        associated_token::token_program = token_program,
    )]
    pub recipient_token_account: InterfaceAccount<'info, TokenAccount>,

    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[program]
pub mod transfer_tokens {
    use super::*;

    pub fn create_token(
        ctx: Context<CreateToken>,
        _token_name: String,  // These are kept for reference but not used
        _token_symbol: String, // in the actual token creation
    ) -> Result<()> {
        msg!("Token created successfully.");
        // Note: The Token Program itself doesn't store name and symbol
        // These parameters are kept for your reference only
        Ok(())
    }

    pub fn mint_token(ctx: Context<MintToken>, amount: u64) -> Result<()> {
        msg!("Minting tokens to associated token account...");
        msg!("Mint: {}", &ctx.accounts.mint_account.key());
        msg!(
            "Token Address: {}",
            &ctx.accounts.associated_token_account.key()
        );

        // Calculate the amount with decimals
        let amount_with_decimals = amount * 10u64.pow(ctx.accounts.mint_account.decimals as u32);

        // Invoke the mint_to instruction on the token program
        let cpi_accounts = MintTo {
            mint: ctx.accounts.mint_account.to_account_info(),
            to: ctx.accounts.associated_token_account.to_account_info(),
            authority: ctx.accounts.mint_authority.to_account_info(),
        };
        
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_context = CpiContext::new(cpi_program, cpi_accounts);
        
        token_interface::mint_to(cpi_context, amount_with_decimals)?;

        msg!("Token minted successfully.");

        Ok(())
    }

    pub fn transfer_tokens(ctx: Context<TransferTokens>, amount: u64) -> Result<()> {
        msg!("Transferring tokens...");
        msg!("Mint: {}", &ctx.accounts.mint_account.key());
        msg!("From Token Address: {}", &ctx.accounts.sender_token_account.key());
        msg!("To Token Address: {}", &ctx.accounts.recipient_token_account.key());

        // Calculate the amount with decimals
        let amount_with_decimals = amount * 10u64.pow(ctx.accounts.mint_account.decimals as u32);
        let decimals = ctx.accounts.mint_account.decimals;

        // Invoke the transfer_checked instruction for better security
        let cpi_accounts = TransferChecked {
            mint: ctx.accounts.mint_account.to_account_info(),
            from: ctx.accounts.sender_token_account.to_account_info(),
            to: ctx.accounts.recipient_token_account.to_account_info(),
            authority: ctx.accounts.sender.to_account_info(),
        };
        
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_context = CpiContext::new(cpi_program, cpi_accounts);
        
        token_interface::transfer_checked(cpi_context, amount_with_decimals, decimals)?;

        msg!("Tokens transferred successfully.");

        Ok(())
    }
}