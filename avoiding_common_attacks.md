#### Re-entrancy Attacks

Internal work is done first in buy and withdraw functions with the transfers performed last.

In the example function withdrawStoreFunds, the internal accounting is handled first (funds are subtracted from the store) before the amountToWithdraw is sent to the caller, as a protection against recursive calls to transfer more than the actual funds owned.
```
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

```

#### Integer Overflow and Underflow

Safe math library is used for addition and subtract on uint. This prevents uints from rolling over to high numbers when an amount subtracted causes them to go below zero, as well as preventing flipping back over to zero when a high enough number is reached through addition.

The SafeMath library:
```
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
```

The marketplace contract then declares it is using SafeMath for uint operations.
```
using SafeMath for uint;
```

The sub and add functions are used on uint operations to prevent integer overflows:
```
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
```