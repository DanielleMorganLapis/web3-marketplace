// SPDX-License-Identifier: Zlib
pragma solidity >=0.5.16 <0.8.0;

/// @title Manageable interface - manages admins, store owners and has pausable functionality
/// @author Danielle Lapis
contract Manageable {
    mapping(address => bool) public admins;
    mapping(address => bool) public storeOwners;

    bool public paused;

    // events
    event AddAdmin(address indexed newAdmin, address indexed admin);
    event RevokeAdmin(address indexed removedAdmin, address indexed admin);
    event AddStoreOwner(address indexed newStoreOwner, address indexed storeOwner);
    event RevokeStoreOwner(address indexed removedStoreOwner, address indexed storeOwner);

    event Pause();
    event Unpause();

    // modifiers
    modifier storeOwnerOnly() {
        require(storeOwners[msg.sender],"Must be a store owner.");
        _;
    }
    
    modifier adminOnly() {
        require(admins[msg.sender],"Must be an admin.");
        _;
    }

    modifier notPaused() {
        require(!paused,"Operations with the online marketplace are currently paused.");
        _;
    }

    modifier isPaused() {
        require(paused,"Can't unpause; currently not paused.");
        _;
    }

    /// @dev Adds a new address as admin
    /// @param admin address for the new admin
    function addAdmin(address admin) adminOnly notPaused external {
        admins[admin] = true;
        emit AddAdmin(admin, msg.sender);
    }

    /// @dev Rmoves a new address as admin
    /// @param admin address to remove as admin
    function revokeAdmin(address admin) adminOnly notPaused external {
        admins[admin] = false;
        emit RevokeAdmin(admin, msg.sender);
    }

    /// @dev Adds a store owner
    /// @param storeOwner address to add as a store owner
    function addStoreOwner(address storeOwner) adminOnly notPaused external {
        storeOwners[storeOwner] = true;
        emit AddStoreOwner(storeOwner, msg.sender);
    }

    /// @dev Removes store owner permissions
    /// @param storeOwner address to remove as a store owner
    function revokeStoreOwner(address storeOwner) adminOnly notPaused external {
        storeOwners[storeOwner] = false;
        emit RevokeStoreOwner(storeOwner, msg.sender);
    }

    /// @dev Circuit breaker - pauses the contract
    function pause() external notPaused adminOnly {
        paused = true;
        emit Pause();
    }

    /// @dev Circuit breaker - unpauses the contract
    function unPause() external isPaused adminOnly {
        paused = false;
        emit Unpause();
    }

    // user status functions

    /// @return returns status of whether the user is an admin or not
    function isAdmin() external view returns (bool) {
        return admins[msg.sender];
    }

    /// @return returns status of whether the user is a store owner or not
    function isStoreOwner() external view returns (bool) {
        return storeOwners[msg.sender];
    }

    /// @return returns true if the store is paused, false if not
    function checkIsPaused() external view returns (bool) {
        return paused;
    }

}