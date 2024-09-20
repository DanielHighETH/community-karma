module karma_tech::note_reporting {
    use aptos_std::ed25519;
    use aptos_framework::account;
    use aptos_framework::resource_account;
    use aptos_framework::object;
    use aptos_std::vector;
    use aptos_std::string::{String, utf8};
    use aptos_std::option;

    struct ModuleData has key {
        admin_address: address,
        min_stake_amount: u64,
        staked_apt_token_ref: object::ResourceRef, // Reference to APT tokens
    }

    const EINVALID_ADMIN: u64 = 1;
    const EINSUFFICIENT_STAKE: u64 = 2;

    // Initialize module with admin address and minimum stake amount
    public entry fun init_module(admin: &signer, min_stake_amount: u64) {
        move_to(admin, ModuleData {
            admin_address: signer::address_of(admin),
            min_stake_amount,
            staked_apt_token_ref: object::create_resource_ref(),
        });
    }

    // Admin sets a new minimum stake amount
    public entry fun set_min_stake_amount(admin: &signer, new_min_stake_amount: u64) acquires ModuleData {
        let module_data = borrow_global_mut<ModuleData>(@karma_tech);
        let admin_address = signer::address_of(admin);
        assert!(admin_address == module_data.admin_address, error::permission_denied(EINVALID_ADMIN));
        module_data.min_stake_amount = new_min_stake_amount;
    }
}
