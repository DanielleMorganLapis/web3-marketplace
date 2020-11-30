/*

The public version of the file used for testing can be found here: https://gist.github.com/ConsenSys-Academy/7d59ba6ebe581c1ffcc981469e226c6e

This test file has been updated for Truffle version 5.0. If your tests are failing, make sure that you are
using Truffle version 5.0. You can check this by running "truffle version"  in the terminal. If version 5 is not
installed, you can uninstall the existing version with `npm uninstall -g truffle` and install the latest version (5.0)
with `npm install -g truffle`.

*/
let BN = web3.utils.BN
let Marketplace = artifacts.require('Marketplace')
let catchRevert = require("./exceptionsHelpers.js").catchRevert

contract('Marketplace', function(accounts) {

    const owner = accounts[0]
    const alice = accounts[1]
    const bob = accounts[2]
  
    const storeName = "Alice's Store"
    const itemName = "Limited Edition Snowglobe"
    const itemPrice = "5"
    const itemQuantity = "10"
    const itemNewPrice = "6"

    let instance

    beforeEach(async () => {
        instance = await Marketplace.new()
    })

    // Marketplace tests

    it("storeId should increment when a new one is created", async () => 
    {
        const result = await instance.getLastStoreId();
        assert.equal(result, 1, 'The constructor creates stores 0 and 1, confirming the current value to be 1')

        const tx = await instance.addStoreOwner(alice);
        const tx2 = await instance.addStore(storeName, { from: alice})

        const result2 = await instance.getLastStoreId();

        assert.equal(result2, 2, 'Checking to make sure it increments to 2 for the Alice Store')
    })

    it("store owner should be able to create a store", async () => {
        const tx = await instance.addStoreOwner(alice);
        const tx2 = await instance.addStore(storeName, { from: alice})

        const getStoreId = await instance.getLastStoreId();

        const result = await instance.fetchStore(getStoreId);

        assert.equal(result[1], storeName, 'the name of the store should match the name of store added')
        assert.equal(result[2], 0, 'Funds for a new store should start at 0')
        assert.equal(result[3], 0, 'Item count for a new store should start at 0')
    })

    it("store owner should be able to add an item", async () => {
        const tx = await instance.addStoreOwner(alice);
        const tx2 = await instance.addStore(storeName, { from: alice})
        const getStoreId = await instance.getLastStoreId();

        const tx3 = await instance.addStoreItem(getStoreId,itemName,itemPrice,itemQuantity, { from: alice })

        const getItemId = await instance.getItemCount(getStoreId, {from: alice})
        const result = await instance.fetchItem(getStoreId,getItemId)

        assert.equal(getItemId,0,'Expected for getItemCount to retrieve 0')
        assert.equal(result[1], itemName, 'The item name should match')
        assert.equal(result[2], itemPrice, 'The item price should match')
        assert.equal(result[3], itemQuantity, 'The item quantity should match' )
    })

    it("store owner should be able to change an item price", async () => {
        const tx = await instance.addStoreOwner(alice);
        const tx2 = await instance.addStore(storeName, { from: alice})
        const getStoreId = await instance.getLastStoreId();
        const tx3 = await instance.addStoreItem(getStoreId,itemName,itemPrice,itemQuantity, { from: alice })
        const getItemId = await instance.getItemCount(getStoreId, {from: alice})
        const tx4 = await instance.changeItemPrice(getStoreId,getItemId,itemNewPrice, { from: alice })
        const result = await instance.fetchItem(getStoreId,0)
        assert.equal(result[2], itemNewPrice, 'The item price should be the new price')
    })

    it("should be possible to buy an item from the store", async () => {
        var bobBalanceBefore = await web3.eth.getBalance(bob);
        //        return (_itemId, name, price, quantity);
        const tx = await instance.fetchItem(0,0);
        var price = BN(tx[2]);
        var quantityBefore = tx[3];

        const tx2 = await instance.buyStoreItem(0,0, {from: bob, value: price }) 
        var bobBalanceAfter = await web3.eth.getBalance(bob);

        const tx3 = await instance.fetchItem(0,0)
        var quantityAfter = Number(tx3[3]);

        assert.equal(quantityAfter,(quantityBefore-1), 'The quantity should be decreased by 1')
        assert.isBelow(Number(bobBalanceAfter), Number(new BN(bobBalanceBefore).sub(new BN(price))), "bob's balance should be reduced by more than the price of the item (including gas costs)")

    })

    it("should be possible to withdraw funds after someone bought from a store", async () => {
        var bobBalanceBefore = await web3.eth.getBalance(bob);
        const amountToWithdraw = 1;
        const storeId = 0;
        const itemId = 0;
        const tx = await instance.fetchItem(storeId,itemId);
        var price = tx[2];
        var quantityBefore = tx[3];

        const tx2 = await instance.buyStoreItem(storeId,itemId, {from: bob, value: price})
        var bobBalanceAfter = await web3.eth.getBalance(bob);

        const tx3 = await instance.fetchItem(storeId,itemId)
        var quantityAfter = Number(tx3[3]);

        var ownerBalanceBefore = await web3.eth.getBalance(owner);

        const tx4 = await instance.fetchStore(storeId, {from: owner});
        var storeFundsBeforeWithdraw = tx4[2];  
        const tx5 = await instance.withdrawStoreFunds(storeId, amountToWithdraw, {from: owner});
        const tx6 = await instance.fetchStore(storeId, {from: owner});
        var storeFundsAfterWithdraw = tx6[2];  

        var ownerBalanceAfter = await web3.eth.getBalance(owner);

        assert.isAbove(Number(storeFundsBeforeWithdraw), Number(storeFundsAfterWithdraw), "The store's balance should have decreased after a withdraw")
        assert.equal(Number(storeFundsAfterWithdraw), Number( new BN(storeFundsBeforeWithdraw).sub( new BN(amountToWithdraw))), "The store's balance should have decreased the amount to withdraw")
        assert.isBelow(Number(ownerBalanceAfter), Number(ownerBalanceBefore), "The store owner's balance should have increased after withdrawing an amount after bob's purchases")

    })

    

    // Manageable tests

    it("should be possible to add an admin", async () => {
        const tx = await instance.addAdmin(alice, { from: owner});
        const result = await instance.isAdmin({from: alice});

        assert.equal(result, true,'Alice should be successfully added as an Admin')
    }
    )

    it("should be possible to add a store owner", async () => {
        const tx = await instance.addStoreOwner(alice, { from: owner});
        const result = await instance.isStoreOwner({from: alice});

        assert.equal(result, true,'Alice should be successfully added as a Store Owner')
    }
    )

    it("should be possible to add a store owner, then remove them", async () => {
        const tx = await instance.addStoreOwner(alice, {from: owner});
        const tx2 = await instance.revokeStoreOwner(alice, {from: owner});

        const result = await instance.isStoreOwner({from: alice});

        assert.equal(result, false,'Alice should no longer be a Store owner')
    })

    it("should be possible to pause the contract", async () => {
        const tx = await instance.pause({from: owner});
        const result = await instance.checkIsPaused({from: owner});

        assert.equal(result, true, 'Contract should be successfully paused')
    })

    it("should be possible to remove an admin", async () => {
        const tx = await instance.addAdmin(alice, { from: owner});
        const tx2 = await instance.revokeAdmin(owner, {from: alice});

        const result = await instance.isAdmin({from: owner});

        assert.equal(result, false, 'Original admin should have had admin access removed successfully');
    })

    it("should be possible to unpause the contract after pausing it", async () => {
        const tx = await instance.pause({from: owner});

        const tx2 = await instance.unPause({from: owner});

        const result = await instance.checkIsPaused({from: owner});

        assert.equal(result, false, 'Contract should be successfully unpaused after being paused once and then unpaused')

    })

})
