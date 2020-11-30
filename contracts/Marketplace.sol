// SPDX-License-Identifier: Zlib
pragma solidity >=0.5.16 <0.8.0;

import "./Manageable.sol";

library SafeMath {
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a, "SafeMath: addition overflow");
        return c;
    }
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        return sub(a, b, "SafeMath: subtraction overflow");
    }

    function sub(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        require(b <= a, errorMessage);
        uint256 c = a - b;

        return c;
    }
}

/// @title Online Marketplace - manages and creates stores and store inventories, allows shoppers to buy items
/// @author Danielle Lapis
contract Marketplace is Manageable {
    using SafeMath for uint;

    mapping(uint => Store) public stores;

    uint lastStoreId;

    struct Store {
        address owner;
        string name;
        uint funds;
        uint highItemId;
        bool firstItemCreated;
        mapping(uint => Item) items;
    }

    struct Item {
        string name;
        uint price;
        uint quantity;
    }

    // Store Owner events 
    event AddStore(address indexed storeOwner, uint storeId, string name);
    event AddNewItem(address indexed storeOwner, uint storeId, uint itemId, string name, uint price, uint quantity);
    event RemoveItem(uint storeId, uint id);
    event ChangePrice(address indexed storeOwner, uint storeId, uint itemId, uint price);
    event WithdrawFunds(address indexed storeOwner, uint storeId, uint funds);

    // Shopper events 
    event BuyItem(uint storeId, uint itemId);

    // Modifiers 
    modifier paidEnough(uint _price) { 
        require(msg.value >= _price,
        "Not enough was paid."); 
        _;}

    modifier enoughQuantity(uint _storeId, uint _itemId) {
        require(stores[_storeId].items[_itemId].quantity > 0,
        "This item is out of stock!");
        _;
    }

    modifier storesSpecificOwner(address _storeOwner, uint _storeId)
    {
        require(stores[_storeId].owner == _storeOwner,
        "Must be this store's owner!");
        _;
    }

    /// @dev Constructor sets up some demo stores and items to start with
    constructor() public {
        paused = false;
        admins[msg.sender] = true;
        storeOwners[msg.sender] = true;
        stores[0].owner = msg.sender;
        stores[0].name = "Survival Items";
        stores[0].funds = 0;
        stores[0].items[0] = Item("Flashlights", 2500, 10);
        stores[0].items[1] = Item("First Aid Kits", 1500, 20);
        stores[0].items[2] = Item("Flares", 1000, 10);
        stores[0].highItemId = 2;
        stores[0].firstItemCreated = true;
        stores[1].owner = msg.sender;
        stores[1].name = "Solidity Programmer Gear";
        stores[1].funds = 0;
        stores[1].items[0] = Item("Lenovo Linux Laptop",50000,10);
        stores[1].items[1] = Item("Macbook Pro laptop",65000,5);
        stores[1].items[2] = Item("I Love Solidity Coffee Mug",3000,100);
        stores[1].highItemId = 2;
        stores[1].firstItemCreated = true;
        lastStoreId = 1;
   }  



    // Store Owner functions 

    /// @dev Adds a new store
    /// @param name Name of the new store
    function addStore(string calldata name) external
    notPaused
    storeOwnerOnly
    {
        require(lastStoreId <= 15,"The limit is 16 stores!");
        lastStoreId += 1;
        uint _storeId = (lastStoreId);
        //stores[_storeId] = Store(msg.sender, _name, 0, 0, false);
        stores[_storeId].owner = msg.sender;
        stores[_storeId].name = name;
        stores[_storeId].funds = 0;
        stores[_storeId].highItemId = 0;
        stores[_storeId].firstItemCreated = false;
        emit AddStore(msg.sender, _storeId, name);
    } 

    /// @dev Adds a new store item
    /// @param storeId id of the store
    /// @param name name of the new item
    /// @param price price of the new item
    /// @param quantity quantity of the new item
    function addStoreItem(uint storeId,string calldata name, uint price, uint quantity)
    external
    notPaused
    storeOwnerOnly storesSpecificOwner(msg.sender, storeId)
    {
        uint _newItemId = 0;
        if (stores[storeId].firstItemCreated)
        {
            // second item or greater
            _newItemId = stores[storeId].highItemId.add(1);
            stores[storeId].highItemId = stores[storeId].highItemId.add(1);
        }
        else 
        {
            // first item in an empty store
            stores[storeId].firstItemCreated = true;
        }
         stores[storeId].items[_newItemId] = Item(name, price, quantity);
        emit AddNewItem(msg.sender, storeId, _newItemId, name, price, quantity);
    }

    /// @dev Removes a store item
    /// @param storeId id of the store
    /// @param itemId id of the item to remove
    function removeStoreItem(uint storeId, uint itemId)
    external
    notPaused
    storeOwnerOnly storesSpecificOwner(msg.sender, storeId)
    {
        delete stores[storeId].items[itemId];
        emit RemoveItem(storeId, itemId);
    }

    /// @dev Changes the price of an item
    /// @param storeId id of the store
    /// @param itemId id of the item to remove
    /// @param newPrice the new price for the item
    function changeItemPrice(uint storeId, uint itemId, uint newPrice)
    external
    notPaused
    storeOwnerOnly storesSpecificOwner(msg.sender, storeId)
    {
        stores[storeId].items[itemId].price = newPrice;
        emit ChangePrice(msg.sender, storeId, itemId, newPrice);
    }

    /// @dev Removes funds from a store
    /// @param storeId id of the store
    /// @param amountToWithdraw amount to withdraw from the store funds
    /// @return withdrawAmount returns the remaining balance in the store
    function withdrawStoreFunds(uint storeId, uint amountToWithdraw)
    payable
    external
    notPaused
    storeOwnerOnly storesSpecificOwner(msg.sender, storeId)
    returns (uint withdrawAmount) 
    {
        require(amountToWithdraw < stores[storeId].funds,"You can't withdraw more funds than what you have acquired.");
        stores[storeId].funds = stores[storeId].funds.sub(amountToWithdraw);
        emit WithdrawFunds(msg.sender, storeId, amountToWithdraw);
        msg.sender.transfer(amountToWithdraw);
        return stores[storeId].funds;
    }

    // Shoppers

    /// @dev Buys an item from a store
    /// @param storeId id of the store to buy from
    /// @param itemId id of the item to buy
    function buyStoreItem(uint storeId, uint itemId)
    external
    payable
    notPaused
    paidEnough(stores[storeId].items[itemId].price)
    enoughQuantity(storeId,itemId)
    {
        uint _amountToRefund = 0;
        uint _amountMinusRefund = msg.value;
        if (msg.value >  stores[storeId].items[itemId].price ) {
          _amountToRefund = msg.value.sub(stores[storeId].items[itemId].price);
          _amountMinusRefund = _amountMinusRefund.sub(_amountToRefund);
        }
        stores[storeId].funds = stores[storeId].funds.add(_amountMinusRefund);
        stores[storeId].items[itemId].quantity = stores[storeId].items[itemId].quantity.sub(1);
        emit BuyItem(storeId, itemId);
        if (_amountToRefund > 0) {
            msg.sender.transfer(_amountToRefund);
        }
    } 

    /// @dev gets data on an item from the store for the front end
    /// @param storeId id of the store
    /// @param itemId id of the item 
    /// @return id id of the item being fetched
    /// @return name name of the item being fetched
    /// @return price price of the item being fetched
    /// @return quantity quantity of the item being fetched
    function fetchItem(uint storeId, uint itemId) external view returns (uint id, string memory name, uint price, uint quantity) {
    //function fetchItem(uint _storeId, uint _itemId) external returns (uint id, string memory name, uint price, uint quantity) {
        name = stores[storeId].items[itemId].name;
        stores[storeId].items[itemId].name;
        price = stores[storeId].items[itemId].price;
        quantity = stores[storeId].items[itemId].quantity;

        //emit FetchItem(_itemId, name, price, quantity);
        return (itemId, name, price, quantity);
    }

    /// @dev gets data on a store for the front end
    /// @param storeId id of the store
    function fetchStore(uint storeId) external view returns (uint id, string memory name, uint funds, uint highItemId, address owner)
    {
        name = stores[storeId].name;
        funds = stores[storeId].funds;
        highItemId = stores[storeId].highItemId;
        owner = stores[storeId].owner;
        return (storeId, name, funds, highItemId, owner);
    }

    /// @dev used in web3 truffle tests
    /// @return id the highest store id
    function getLastStoreId() external view returns (uint id) {
        return lastStoreId;
    }

    /// @dev get the highest item id in a store
    /// @param id the id of the store
    /// @return highItemId the highest item id
    function getItemCount(uint id) external view returns (uint highItemId) {
        return stores[id].highItemId;
    }

    /// @dev Used when initially loading the front end
    /// @return userIsAdmin status of the user as an admin or not
    /// @return userIsStoreOwner status of the user as a stoer owner
    /// @return id highest store id, used for loading the stores
    function getFrontEndData() external view returns(bool userIsAdmin, bool userIsStoreOwner, uint id)
    {
        return (admins[msg.sender],storeOwners[msg.sender],lastStoreId);
    }

}