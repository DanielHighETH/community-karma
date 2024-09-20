module karma_tech::note_reporting {
    use aptos_framework::coin;
    use aptos_framework::account;
    use aptos_std::ed25519;
    use aptos_std::vector;
    use aptos_std::string::{String, utf8};
    use aptos_std::option;

    struct ModuleData has key {
        admin_address: address,
        min_stake_amount: u64,
        staked_apt_token_ref: coin::Coin<aptos_std::aptos::AptosToken>, // Use AptosToken here
    }

    struct NoteStatus has key, store {
        is_reported: bool,
        reason_id: u64,
    }

    const EINVALID_ADMIN: u64 = 1;
    const EINSUFFICIENT_STAKE: u64 = 2;

    // Initialize module with admin address and minimum stake amount
    public entry fun init_module(admin: &signer, min_stake_amount: u64) {
        move_to(admin, ModuleData {
            admin_address: signer::address_of(admin),
            min_stake_amount,
            staked_apt_token_ref: coin::create<aptos_std::aptos::AptosToken>(0), // Initialize with 0 tokens
        });
    }

    // Admin sets a new minimum stake amount
    public entry fun set_min_stake_amount(admin: &signer, new_min_stake_amount: u64) acquires ModuleData {
        let module_data = borrow_global_mut<ModuleData>(@karma_tech);
        let admin_address = signer::address_of(admin);
        assert!(admin_address == module_data.admin_address, error::permission_denied(EINVALID_ADMIN));
        module_data.min_stake_amount = new_min_stake_amount;
    }

    // Function to report a note by staking APT tokens
    public entry fun report_note(
        note_id: u64,
        reason_id: u64,
        amount: u64,
        sender: &signer
    ) acquires ModuleData {
        let module_data = borrow_global<ModuleData>(@karma_tech);
        let sender_address = signer::address_of(sender);

        // Check if the staked amount is sufficient
        assert!(amount >= module_data.min_stake_amount, error::insufficient_funds(EINSUFFICIENT_STAKE));

        // Transfer APT tokens to the contract
        let sender_coin_ref = coin::borrow_global<aptos_std::aptos::AptosToken>(sender_address);
        coin::transfer(sender_coin_ref, &module_data.staked_apt_token_ref, amount);

        // Update note status
        move_to(sender, NoteStatus {
            is_reported: true,
            reason_id,
        });
    }

    // Retrieve note status by ID
    public entry fun get_note_status(note_id: u64) : NoteStatus {
        borrow_global<NoteStatus>(note_id)
    }
}
