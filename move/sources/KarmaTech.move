module karmaTech::karmaTech {
    use aptos_framework::fungible_asset::{Self, MintRef, TransferRef, BurnRef, Metadata, FungibleAsset};
    use aptos_framework::object::{Self, Object};
    use aptos_framework::primary_fungible_store;
    use std::error;
    use std::signer;
    use std::string::utf8;
    use std::option;
    use std::table;
    use std::vector;

    const ENOT_OWNER: u64 = 1;
    const ENOT_ENOUGH_BALANCE: u64 = 2;

    const ASSET_SYMBOL: vector<u8> = b"KARMA";

    const DEFAULT_STAKE_AMOUNT: u64 = 30000000000; // 3000 Tokens

    #[resource_group_member(group = aptos_framework::object::ObjectGroup)]
    /// Hold refs to control the minting, transfer, and burning of fungible assets.
    struct ManagedFungibleAsset has key {
        mint_ref: MintRef,
        transfer_ref: TransferRef,
        burn_ref: BurnRef,
    }

    /// Struct to store report information
    struct ReportInfo has copy, drop, store {
        reporter: address,
        reason_id: u64,
    }

    struct ModuleData has key {
        mint_ref: MintRef,
        min_stake_amount: u64,
        reports: table::Table<u64, vector<ReportInfo>>,
    }

    /// The KarmaToken struct (Fungible Token)
    struct KarmaToken has key {}

    /// Initialize metadata object and store the refs.
    fun init_module(admin: &signer) {
        let constructor_ref = &object::create_named_object(admin, ASSET_SYMBOL);
        primary_fungible_store::create_primary_store_enabled_fungible_asset(
            constructor_ref,
            option::none(),
            utf8(b"KARMA Token"), /* name */
            utf8(ASSET_SYMBOL), /* symbol */
            7, /* decimals */
            utf8(b"http://example.com/favicon.ico"), /* icon */
            utf8(b"http://community-karma.vercel.app"), /* project */
        );

        // Create mint/burn/transfer refs to allow the creator to manage the fungible asset.
        let mint_ref = fungible_asset::generate_mint_ref(constructor_ref);
        let burn_ref = fungible_asset::generate_burn_ref(constructor_ref);
        let transfer_ref = fungible_asset::generate_transfer_ref(constructor_ref);

        // Create a table to store reports for each note_id.
        let reports_table = table::new<u64, vector<ReportInfo>>();


        move_to(admin, ModuleData {
            mint_ref,
            min_stake_amount: DEFAULT_STAKE_AMOUNT,
            reports: reports_table,
        });

        // Now create ManagedFungibleAsset with a fresh mint_ref since the previous one was moved.
        let metadata_object_signer = object::generate_signer(constructor_ref);
        let mint_ref_new = fungible_asset::generate_mint_ref(constructor_ref);
        move_to(
            &metadata_object_signer,
            ManagedFungibleAsset {
                mint_ref: mint_ref_new,
                transfer_ref,
                burn_ref,
            }
        );
    }

    #[view]
    /// Return the address of the managed fungible asset that's created when this module is deployed.
    public fun get_metadata(): Object<Metadata> {
        let asset_address = object::create_object_address(&@karmaTech, ASSET_SYMBOL);
        object::address_to_object<Metadata>(asset_address)
    }

    #[view]
    // Function to view the current min_stake_amount
    public fun view_min_stake_amount(): u64 acquires ModuleData {
        let module_data = borrow_global<ModuleData>(@karmaTech);
        module_data.min_stake_amount
    }

    #[view]
    /// Function to retrieve reports for a given note_id.
    public fun get_reports(note_id: u64): vector<ReportInfo> acquires ModuleData {
        let module_data = borrow_global<ModuleData>(@karmaTech);

        if (table::contains(&module_data.reports, note_id)) {
            let reports_ref = table::borrow(&module_data.reports, note_id);
            *reports_ref
        } else {
            vector::empty<ReportInfo>()
        }
    }

    /// Mint as the owner of metadata object and deposit to a specific account.
    public entry fun mint(admin: &signer, to: address, amount: u64) acquires ManagedFungibleAsset {
        let asset = get_metadata();
        let managed_fungible_asset = authorized_borrow_refs(admin, asset);

        let to_wallet = primary_fungible_store::ensure_primary_store_exists(to, asset);
        let fa = fungible_asset::mint(&managed_fungible_asset.mint_ref, amount);
        fungible_asset::deposit_with_ref(&managed_fungible_asset.transfer_ref, to_wallet, fa);
    }

    /// Transfer as the owner of metadata object ignoring `frozen` field.
    public entry fun transfer(from: &signer, to: address, amount: u64) acquires ManagedFungibleAsset {
        let asset = get_metadata();
        let transfer_ref = &borrow_global<ManagedFungibleAsset>(object::object_address(&asset)).transfer_ref;
        let from_wallet = primary_fungible_store::primary_store(signer::address_of(from), asset);
        let to_wallet = primary_fungible_store::ensure_primary_store_exists(to, asset);
        fungible_asset::transfer_with_ref(transfer_ref, from_wallet, to_wallet, amount);
    }

    /// Burn fungible assets as the owner of metadata object.
    public entry fun burn(from: &signer, amount: u64) acquires ManagedFungibleAsset {
        let asset = get_metadata();
        let burn_ref = &borrow_global<ManagedFungibleAsset>(object::object_address(&asset)).burn_ref;
        let from_wallet = primary_fungible_store::primary_store(signer::address_of(from), asset);
        fungible_asset::burn_from(burn_ref, from_wallet, amount);
    }

    /// Freeze an account so it cannot transfer or receive fungible assets.
    public entry fun freeze_account(admin: &signer, account: address) acquires ManagedFungibleAsset {
        let asset = get_metadata();
        let transfer_ref = &authorized_borrow_refs(admin, asset).transfer_ref;
        let wallet = primary_fungible_store::ensure_primary_store_exists(account, asset);
        fungible_asset::set_frozen_flag(transfer_ref, wallet, true);
    }

    /// Unfreeze an account so it can transfer or receive fungible assets.
    public entry fun unfreeze_account(admin: &signer, account: address) acquires ManagedFungibleAsset {
        let asset = get_metadata();
        let transfer_ref = &authorized_borrow_refs(admin, asset).transfer_ref;
        let wallet = primary_fungible_store::ensure_primary_store_exists(account, asset);
        fungible_asset::set_frozen_flag(transfer_ref, wallet, false);
    }

    /// Withdraw as the owner of metadata object ignoring `frozen` field.
    public fun withdraw(admin: &signer, amount: u64, from: address) : FungibleAsset acquires ManagedFungibleAsset {
        let asset = get_metadata();
        let transfer_ref = &authorized_borrow_refs(admin, asset).transfer_ref;
        let from_wallet = primary_fungible_store::primary_store(from, asset);
        fungible_asset::withdraw_with_ref(transfer_ref, from_wallet, amount)
    }

    /// Deposit as the owner of metadata object ignoring `frozen` field.
    public fun deposit(admin: &signer, to: address, fa: FungibleAsset) acquires ManagedFungibleAsset {
        let asset = get_metadata();
        let transfer_ref = &authorized_borrow_refs(admin, asset).transfer_ref;
        let to_wallet = primary_fungible_store::ensure_primary_store_exists(to, asset);
        fungible_asset::deposit_with_ref(transfer_ref, to_wallet, fa);
    }

    /// Function to set the minimum required stake amount, only by the owner.
    public entry fun set_min_stake_amount(owner: &signer, new_min_stake_amount: u64) acquires ModuleData {
        let asset = get_metadata();
        assert!(object::is_owner(asset, signer::address_of(owner)), error::permission_denied(ENOT_OWNER));

        let module_data = borrow_global_mut<ModuleData>(@karmaTech);
        module_data.min_stake_amount = new_min_stake_amount;
    }

    /// Function for users to report a note by staking KARMA tokens.
    public entry fun report_note(reporter: &signer, note_id: u64, reason_id: u64) acquires ModuleData, ManagedFungibleAsset {
        let reporter_address = signer::address_of(reporter);
        let asset = get_metadata();

        let module_data = borrow_global_mut<ModuleData>(@karmaTech);
        let managed_fungible_asset = borrow_global<ManagedFungibleAsset>(object::object_address(&asset));

        // Ensure the reporter has enough coins to stake.
        let from_wallet = primary_fungible_store::primary_store(reporter_address, asset);
        assert!(fungible_asset::balance(from_wallet) >= module_data.min_stake_amount, ENOT_ENOUGH_BALANCE);

        // Transfer the required stake amount from the reporter to the module.
        let module_wallet = primary_fungible_store::ensure_primary_store_exists(@karmaTech, asset);
        fungible_asset::transfer_with_ref(&managed_fungible_asset.transfer_ref, from_wallet, module_wallet, module_data.min_stake_amount);

        // Get existing reports for the note_id, or initialize a new vector.
        let reports = if (table::contains(&module_data.reports, note_id)) {
            table::borrow_mut(&mut module_data.reports, note_id)
        } else {
            let new_reports = vector::empty<ReportInfo>();
            table::add(&mut module_data.reports, note_id, new_reports);
            table::borrow_mut(&mut module_data.reports, note_id)
        };

        // Add the new report.
        let report_info = ReportInfo {
            reporter: reporter_address,
            reason_id,
        };
        vector::push_back(reports, report_info);
    }

    /// Borrow the immutable reference of the refs of `metadata`.
    /// This validates that the signer is the metadata object's owner.
    inline fun authorized_borrow_refs(
        owner: &signer,
        asset: Object<Metadata>,
    ): &ManagedFungibleAsset acquires ManagedFungibleAsset {
        assert!(object::is_owner(asset, signer::address_of(owner)), error::permission_denied(ENOT_OWNER));
        borrow_global<ManagedFungibleAsset>(object::object_address(&asset))
    }
}
