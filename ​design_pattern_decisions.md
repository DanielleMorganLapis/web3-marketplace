#### Fail early and fail loud

paidEnough, enoughQuantity, storesSpecificOwner modifiers and other requirements at the start of functions to check if the function should be executed.

In this example, modifier paidEnough ensures that at least that price of the item was paid, or greater.
```
    modifier paidEnough(uint _price) { 
        require(msg.value >= _price,
        "Not enough was paid."); 
        _;}
```

The enoughQuantity modifier ensures that there is enough quantity for an item to be purchased.
```
    modifier enoughQuantity(uint _storeId, uint _itemId) {
        require(stores[_storeId].items[_itemId].quantity > 0,
        "This item is out of stock!");
        _;
    }
```

#### Restricting Access

Modifiers and the isAdmin and isStoreOwner roles in the front-end restrict access to the Administrator and Store Owner specific functionality. Store Owners are restricted to their own stores with the storesSpecificOwner modifier.

The admin mapping and modifier:
```
    mapping(address => bool) public admins;

    modifier adminOnly() {
        require(admins[msg.sender],"Must be an admin.");
        _;
    }
```

#### Circuit Breaker
Pause functionality is available for administrators to shut down the contract.

Modifiers check to see if the contract is paused. There is an isPaused modifier as well, to ensure that the contract is not paused already:
```
    modifier notPaused() {
        require(!paused,"Operations with the online marketplace are currently paused.");
        _;
    }

    modifier isPaused() {
        require(paused,"Can't unpause; currently not paused.");
        _;
    }
```

Functions in the Manageable interface pause and unpause the contract:
```
    function pause() external notPaused adminOnly {
        paused = true;
        emit Pause();
    }

    /// @dev Circuit breaker - unpauses the contract
    function unPause() external isPaused adminOnly {
        paused = false;
        emit Unpause();
    }
```