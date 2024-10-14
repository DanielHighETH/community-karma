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
    const ENOT_FOUND: u64 = 3;

    const ASSET_SYMBOL: vector<u8> = b"KARMA";

    const DEFAULT_STAKE_AMOUNT: u64 = 30000000000; // 3000 Tokens
    const DEFAULT_APR_REWARD: u64 = 10000000000; // 1000 Tokens

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
    }

    /// Struct to store vote information
    struct VoteInfo has copy, drop, store {
        voter: address,
        vote: u8, // 1 for truth, 0 for false
        amount: u64,
    }

    struct ModuleData has key {
        mint_ref: MintRef,
        min_stake_amount: u64,
        apr_reward: u64,
        reports: table::Table<u64, vector<ReportInfo>>,
        votes: table::Table<u64, vector<VoteInfo>>, 
        payouts_processed: table::Table<u64, bool>,
    }

    /// Initialize metadata object and store the refs.
    fun init_module(admin: &signer) {
        let constructor_ref = &object::create_named_object(admin, ASSET_SYMBOL);
        primary_fungible_store::create_primary_store_enabled_fungible_asset(
            constructor_ref,
            option::none(),
            utf8(b"KARMA Token"), /* name */
            utf8(ASSET_SYMBOL), /* symbol */
            7, /* decimals */
            utf8(b"https://community-karma.vercel.app/favicon.ico"), /* icon */
            utf8(b"https://community-karma.vercel.app/"), /* project */
        );

        // Create mint/burn/transfer refs to allow the creator to manage the fungible asset.
        let mint_ref = fungible_asset::generate_mint_ref(constructor_ref);
        let burn_ref = fungible_asset::generate_burn_ref(constructor_ref);
        let transfer_ref = fungible_asset::generate_transfer_ref(constructor_ref);

        // Create tables to store reports and votes.
        let reports_table = table::new<u64, vector<ReportInfo>>();
        let votes_table = table::new<u64, vector<VoteInfo>>();
        let payouts_table = table::new<u64, bool>();

        move_to(admin, ModuleData {
            mint_ref,
            min_stake_amount: DEFAULT_STAKE_AMOUNT,
            apr_reward: DEFAULT_APR_REWARD,
            reports: reports_table,
            votes: votes_table,
            payouts_processed: payouts_table,
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

    #[view]
    /// Function to view the total staked tokens for truth and false votes on a reported note.
    public fun view_staked_tokens(note_id: u64): (u64, u64) acquires ModuleData {
        let module_data = borrow_global<ModuleData>(@karmaTech);

        // Ensure that votes exist for the given note.
        assert!(table::contains(&module_data.votes, note_id), ENOT_FOUND);

        let votes = table::borrow(&module_data.votes, note_id);
        let votes_len = vector::length(votes);

        // Initialize counters for truth and false stakes
        let total_truth_stake = 0u64;
        let total_false_stake = 0u64;

        // Loop through the votes to calculate total truth and false stakes
        for (i in 0..votes_len) {
            let vote_info = vector::borrow(votes, i);
            if (vote_info.vote == 1) {
                total_truth_stake = total_truth_stake + vote_info.amount;
            } else {
                total_false_stake = total_false_stake + vote_info.amount;
            };
        };

        // Return the total truth and false stakes
        (total_truth_stake, total_false_stake)
    }

    #[view]
    // Function to view the current APR_REWARD
    public fun view_apr_reward(): u64 acquires ModuleData {
        let module_data = borrow_global<ModuleData>(@karmaTech);
        module_data.apr_reward
    }

    /// Function to set a new APR_REWARD, only owner can change this
    public entry fun set_apr_reward(owner: &signer, new_apr_reward: u64) acquires ModuleData {
        let module_data = borrow_global_mut<ModuleData>(@karmaTech);

        // Ensure that only the owner can change the APR_REWARD
        assert!(object::is_owner(get_metadata(), signer::address_of(owner)), error::permission_denied(ENOT_OWNER));

        // Set the new APR reward
        module_data.apr_reward = new_apr_reward;
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
    public entry fun report_note(reporter: &signer, note_id: u64) acquires ModuleData, ManagedFungibleAsset {
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
        };
        vector::push_back(reports, report_info);
    }

    /// Function for users to submit a vote by staking tokens.
    /// Parameters:
    /// - reporter: The signer submitting the vote.
    /// - note_id: The note being voted on.
    /// - amount: The amount of tokens staked on the vote.
    /// - vote: 1 for truth, 0 for false.
    public entry fun submit_vote(reporter: &signer, note_id: u64, amount: u64, vote: u8) acquires ModuleData, ManagedFungibleAsset {
        let reporter_address = signer::address_of(reporter);
        let asset = get_metadata();

        let module_data = borrow_global_mut<ModuleData>(@karmaTech);
        let managed_fungible_asset = borrow_global<ManagedFungibleAsset>(object::object_address(&asset));

        // Ensure the amount is greater than 0.
        assert!(amount > 0, ENOT_ENOUGH_BALANCE);

        // Ensure the reporter has enough tokens to stake.
        let from_wallet = primary_fungible_store::primary_store(reporter_address, asset);
        assert!(fungible_asset::balance(from_wallet) >= amount, ENOT_ENOUGH_BALANCE);

        // Transfer the staked amount from the reporter to the module.
        let module_wallet = primary_fungible_store::ensure_primary_store_exists(@karmaTech, asset);
        fungible_asset::transfer_with_ref(&managed_fungible_asset.transfer_ref, from_wallet, module_wallet, amount);

        // Store the vote along with the staked amount.
        let vote_info = VoteInfo {
            voter: reporter_address,
            vote,
            amount,
        };

        // Get existing votes for the note_id, or initialize a new vector.
        let votes = if (table::contains(&module_data.votes, note_id)) {
            table::borrow_mut(&mut module_data.votes, note_id)
        } else {
            let new_votes = vector::empty<VoteInfo>();
            table::add(&mut module_data.votes, note_id, new_votes);
            table::borrow_mut(&mut module_data.votes, note_id)
        };

        // Add the new vote.
        vector::push_back(votes, vote_info);
    }

    /// Function to handle payouts after voting is closed.
    /// - note_id: The ID of the note being voted on.
    public entry fun payout(owner: &signer, note_id: u64) acquires ModuleData, ManagedFungibleAsset {
        let module_data = borrow_global_mut<ModuleData>(@karmaTech);
        let asset = get_metadata();
        let managed_fungible_asset = borrow_global<ManagedFungibleAsset>(object::object_address(&asset));

        // Ensure that only the owner can call this function.
        assert!(object::is_owner(asset, signer::address_of(owner)), error::permission_denied(ENOT_OWNER));

        // Ensure that votes exist for the given note.
        assert!(table::contains(&module_data.votes, note_id), ENOT_FOUND);

        // Check if the payout has already been processed
        if (table::contains(&module_data.payouts_processed, note_id)) {
            abort(ENOT_FOUND)
        };

        // Mark the payout as processed
        table::add(&mut module_data.payouts_processed, note_id, true);

        let votes = table::borrow(&module_data.votes, note_id);
        let votes_len = vector::length(votes);

        let total_truth_stake = 0u64;
        let total_false_stake = 0u64;

        for (i in 0..votes_len) {
            let vote_info = vector::borrow(votes, i);
            if (vote_info.vote == 1) {
                total_truth_stake = total_truth_stake + vote_info.amount;
            } else {
                total_false_stake = total_false_stake + vote_info.amount;
            };
        };

        let is_truth_majority = total_truth_stake > total_false_stake;
        let module_wallet = primary_fungible_store::ensure_primary_store_exists(@karmaTech, asset);

        let reward_pool = if (is_truth_majority) {
            total_false_stake
        } else {
            total_truth_stake
        };

        let (voters_reward_pool, apr_reward_voters) = if (is_truth_majority) {
            (reward_pool * 70 / 100, module_data.apr_reward * 70 / 100) 
        } else {
            (reward_pool * 100 / 100, module_data.apr_reward * 100 / 100)
        };

        let reporter_reward_pool = if (is_truth_majority) {
            reward_pool * 30 / 100
        } else {
            0u64
        };

        let apr_reward_reporter = if (is_truth_majority) {
            module_data.apr_reward * 30 / 100
        } else {
            0u64
        };

        let total_winning_stake = if (is_truth_majority) {
            total_truth_stake
        } else {
            total_false_stake
        };

        for (i in 0..votes_len) {
            let vote_info = vector::borrow(votes, i);
            let from_wallet = primary_fungible_store::primary_store(vote_info.voter, asset);

            if (is_truth_majority && vote_info.vote == 1) {
                let proportion = vote_info.amount * 10000 / total_winning_stake;
                let reward_from_lost = proportion * voters_reward_pool / 10000;
                let apr_reward = proportion * apr_reward_voters / 10000;

                let staked_amount_return = vote_info.amount;
                let total_reward = staked_amount_return + reward_from_lost + apr_reward;

                fungible_asset::transfer_with_ref(&managed_fungible_asset.transfer_ref, module_wallet, from_wallet, total_reward);

            } else if (!is_truth_majority && vote_info.vote == 0) {
                let proportion = vote_info.amount * 10000 / total_winning_stake;
                let reward_from_lost = proportion * voters_reward_pool / 10000;
                let apr_reward = proportion * apr_reward_voters / 10000;

                let staked_amount_return = vote_info.amount;
                let total_reward = staked_amount_return + reward_from_lost + apr_reward;

                fungible_asset::transfer_with_ref(&managed_fungible_asset.transfer_ref, module_wallet, from_wallet, total_reward);
            };
        };

        let reports = table::borrow_mut(&mut module_data.reports, note_id);
        let report_info = vector::borrow(&*reports, vector::length(reports) - 1);
        let reporter_wallet = primary_fungible_store::primary_store(report_info.reporter, asset);

        if (is_truth_majority) {
            let reporter_reward = module_data.min_stake_amount + reporter_reward_pool + apr_reward_reporter;
            fungible_asset::transfer_with_ref(&managed_fungible_asset.transfer_ref, module_wallet, reporter_wallet, reporter_reward);
        }
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
