module karma_tech::report_system {
    use std::error;
    use std::signer;
    use std::string::{Self, String};
    use std::vector;
    use aptos_framework::account;
    use aptos_framework::resource_account;
    use aptos_framework::object;
    use aptos_framework::fungible_asset::{Self as FA, MintRef};
    use aptos_framework::primary_fungible_store;
    use std::option;
    use std::table;

    /// Struct to store report information
    struct ReportInfo has copy, drop, store {
        reporter: address,
        reason_id: u64,
    }

    struct ModuleData has key {
        signer_cap: account::SignerCapability,
        mint_ref: MintRef, // MintRef from FA standard
        min_stake_amount: u64,
        reports: table::Table<u64, vector<ReportInfo>>, // Reports table
    }

    /// The KarmaToken struct (Fungible Token)
    struct KarmaToken has key {}

    const E_NOT_ADMIN: u64 = 1;

    /// Initialize the module and create KarmaToken
    fun init_module(resource_signer: &signer) {
        let signer_cap = resource_account::retrieve_resource_account_cap(resource_signer, @karma_tech);

        // Create a sticky object to store the KarmaToken metadata
        let constructor_ref = object::create_sticky_object(signer::address_of(resource_signer));

        // Create the fungible asset (FA) for KarmaToken
        primary_fungible_store::create_primary_store_enabled_fungible_asset(
            &constructor_ref,
            option::none(), // No maximum supply
            string::utf8(b"Karma Token"), // Token name
            string::utf8(b"KARMA"), // Token symbol
            8, // Decimals
            string::utf8(b"https://example.com/token.png"), // Token icon URL
            string::utf8(b"https://example.com") // Project URL
        );

        // Generate a MintRef to enable token minting
        let mint_ref = FA::generate_mint_ref(&constructor_ref);

        // Initialize a new reports table
        let reports_table = table::new<u64, vector<ReportInfo>>();

        // Store module data
        move_to(resource_signer, ModuleData {
            signer_cap,
            mint_ref,
            min_stake_amount: 1000000,
            reports: reports_table,
        });
    }

    /// Admin-only function to set the minimum required stake amount
    public entry fun set_min_stake_amount(admin: &signer, new_min_stake_amount: u64) acquires ModuleData {
        let admin_address = signer::address_of(admin);
        assert!(admin_address == @karma_tech, error::permission_denied(E_NOT_ADMIN));

        let module_data = borrow_global_mut<ModuleData>(@karma_tech);
        module_data.min_stake_amount = new_min_stake_amount;
    }

    /// Admin-only function to mint KARMA tokens to a specified address
    public entry fun mint_tokens(admin: &signer, to: address, amount: u64) acquires ModuleData {
        let admin_address = signer::address_of(admin);
        assert!(admin_address == @karma_tech, error::permission_denied(E_NOT_ADMIN));

        let module_data = borrow_global<ModuleData>(@karma_tech);
        let coins = FA::mint(&module_data.mint_ref, amount);

        // Deposit the minted tokens into the recipient's primary store
        primary_fungible_store::deposit(to, coins);
    }

    /// Function for users to report a note by staking KARMA tokens (via minting)
    public entry fun report_note(reporter: &signer, note_id: u64, reason_id: u64) acquires ModuleData {
        let reporter_address = signer::address_of(reporter);

        let module_data = borrow_global_mut<ModuleData>(@karma_tech);

        // Mint the required stake amount of tokens (simulating staking)
        let coins = FA::mint(&module_data.mint_ref, module_data.min_stake_amount);

        // Deposit the tokens into the module's account
        primary_fungible_store::deposit(@karma_tech, coins);

        // Get existing reports for the note_id, or initialize a new vector
        let reports = if (table::contains(&module_data.reports, note_id)) {
            table::borrow_mut(&mut module_data.reports, note_id)
        } else {
            let new_reports = vector::empty<ReportInfo>();
            table::add(&mut module_data.reports, note_id, new_reports);
            table::borrow_mut(&mut module_data.reports, note_id)
        };

        // Add the new report
        let report_info = ReportInfo {
            reporter: reporter_address,
            reason_id,
        };
        vector::push_back(reports, report_info);
    }

    /// Function to retrieve reports for a given note_id
    public fun get_reports(note_id: u64): vector<ReportInfo> acquires ModuleData {
        let module_data = borrow_global<ModuleData>(@karma_tech);

        if (table::contains(&module_data.reports, note_id)) {
            let reports_ref = table::borrow(&module_data.reports, note_id);
            *reports_ref
        } else {
            vector::empty<ReportInfo>()
        }
    }
}
