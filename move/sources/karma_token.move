module karma_tech::karma_token {
    use std::signer;
    use aptos_framework::fungible_asset::{Self as FA, MintCapability, BurnCapability, FungibleAssetMetadata};
    use aptos_framework::account;
    use aptos_framework::primary_fungible_store;

    /// Resource to hold the mint and burn capabilities
    struct KarmaTokenCapabilities has key {
        mint_cap: MintCapability<KarmaToken>,
        burn_cap: BurnCapability<KarmaToken>,
    }

    /// The KARMA token struct
    struct KarmaToken has store {}

    /// Initialize the KARMA token
    public entry fun initialize(admin: &signer) acquires KarmaTokenCapabilities {
        let admin_address = signer::address_of(admin);
        assert!(admin_address == @karma_tech, 1);

        // Create the Fungible Asset (FA) metadata
        let (mint_cap, burn_cap) = FA::register<KarmaToken>(
            admin,
            string::utf8(b"KARMA Token"), // Name
            string::utf8(b"KARMA"),       // Symbol
            8,                            // Decimals
            option::none<string::String>(), // Icon URL
            option::none<string::String>()  // Project URL
        );

        // Store the mint and burn capabilities
        move_to(admin, KarmaTokenCapabilities {
            mint_cap,
            burn_cap,
        });
    }

    /// Function to mint KARMA tokens to a specified address
    public entry fun mint_tokens(admin: &signer, to: address, amount: u64) acquires KarmaTokenCapabilities {
        let admin_address = signer::address_of(admin);
        assert!(admin_address == @karma_tech, 1);

        let caps = borrow_global<KarmaTokenCapabilities>(admin_address);
        let mint_cap = &caps.mint_cap;

        let coins = FA::mint_with_capability<KarmaToken>(mint_cap, amount);

        // Deposit the minted tokens into the recipient's primary store
        primary_fungible_store::deposit<KarmaToken>(to, coins);
    }

    /// Function to burn KARMA tokens from the caller's account
    public entry fun burn_tokens(sender: &signer, amount: u64) acquires KarmaTokenCapabilities {
        let caps = borrow_global<KarmaTokenCapabilities>(@karma_tech);
        let burn_cap = &caps.burn_cap;

        // Withdraw the tokens from the sender
        let coins = primary_fungible_store::withdraw<KarmaToken>(sender, amount);

        // Burn the tokens
        FA::burn_with_capability<KarmaToken>(burn_cap, coins);
    }
}
