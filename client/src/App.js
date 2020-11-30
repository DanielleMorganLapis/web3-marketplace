import React, { Component } from "react";
//import ManageableContract from "./contracts/Manageable.json";
import MarketplaceContract from "./contracts/Marketplace.json";
import getWeb3 from "./getWeb3.js";

import "./App.css";

/*
function Store(props) {
  return (
      <button className="store" onClick={props.onClick}>
          {props.value}
      </button>
  )
}*/

class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      
      // web3, the accounts and the contract
      web3: null, accounts: null, contract: null,

      // set to true to get a display of admin / store owner status and store information
      displayDebuggingInfo: false, 

      // roles
      isAdmin: false, isStoreOwner: false, 

      // stores
      lastStoreId: 0, storeList: [], 
      
      // display message
      message: '', 

      // admin management form values
      addAdminAddress: '',
      addRevokeAddress: '', // remove admin input 
      addStoreOwnerAddress: '',
      revokeStoreOwnerAddress: '', // remove store owner input
      addStoreName: '',
      stores: null,
      storeSelected: "None selected", // for the name of the currently selected store
      storeSelectedId: null, // currently selected store id
      itemList: [], // the array of items of the currently viewed store
      storeSelectedOwner: false, // tracks if viewer is viewing a store they own
      storeSelectedFunds: 0,
      storeHighItemId: null,

      // store function form values
      addItemName: '',
      addItemPrice: '',
      addItemQuantity: '',
      deleteItemId: '',
      changeItemPriceId: '',
      changeItemNewPrice: '',
      changeWithdraw: ''
    };

    // generic multi input changer
    this.handleInputChange = this.handleInputChange.bind(this);

    // functions
    this.addAdmin = this.addAdmin.bind(this);
    this.revokeAdmin = this.revokeAdmin.bind(this);
    this.addStoreOwner = this.addStoreOwner.bind(this);
    this.revokeStoreOwner = this.revokeStoreOwner.bind(this);
    this.addStore = this.addStore.bind(this);

    // Items
    this.addStoreItem = this.addStoreItem.bind(this);
    this.deleteStoreItem = this.deleteStoreItem.bind(this);
    this.changeItemPrice = this.changeItemPrice.bind(this);
    this.withdrawFunds = this.withdrawFunds.bind(this);

}

componentDidMount = async () => {
  try {
    // Get network provider and web3 instance.
    const web3 = await getWeb3();

    // Use web3 to get the user's accounts.
    const accounts = await web3.eth.getAccounts();

    // Get the contract instance.
    const networkId = await web3.eth.net.getId();
    console.log("Network Id: " + networkId);
    const deployedNetwork = await MarketplaceContract.networks[networkId];
    console.log("Deployed network: " + deployedNetwork);
    const instance = new web3.eth.Contract(
      MarketplaceContract.abi,
     deployedNetwork && deployedNetwork.address,
    );

    this.setState({ web3, accounts, contract: instance }  , this.runSetup); //);
    
  } catch (error) {
    // Catch any errors for any of the above operations.
    alert(
      `Failed to load web3, accounts, or contract. Check console for details.`,
    );
    console.error(error);
  }
};

runSetup = async () => {
  const { accounts, contract } = this.state;

  const getUser = await contract.methods.getFrontEndData().call({ from: accounts[0] });

  this.setState({ isAdmin: getUser[0], isStoreOwner: getUser[1], lastStoreId: getUser[2] })

  this.updateStoreList();
  
};

updateStoreList = async () => {
  const { accounts, lastStoreId, contract } = this.state;
  console.log("Regenerating the list of stores. Running updateStoreList with lastStoreId: " + lastStoreId);

  // get initial list of stores
  var i;
  var storeList = [];
  for (i = 0; i <= lastStoreId; i++) {
    let storeName = await contract.methods.fetchStore(i).call();
    storeList.push(storeName)
    //if (i == storeSelectedId) {
    //  console.log("Fixing the store selected funds value, setting to: " + storeName.funds );
    //  this.setState({ storeSelectedFunds: storeName.funds }); // update the funds available to withdraw in currently viewed store 
    // }
  }

  let newStoreList = storeList;
    newStoreList.forEach((store) => {
     if (accounts[0] === store.owner)
     {
       store.isStoresOwner = true;
     }
     else
     {
       store.isStoresOwner = false
     }
   })
  this.setState({ storeList: storeList, lastStoreId: lastStoreId});
}

addAdmin = async (event) => {
  event.preventDefault(); // this prevents the whole page from reloading
  console.log("Adding admin . . . " + this.state.addAdminAddress);
  const { contract, accounts } = this.state;
  this.setState({ message: "Adding admin . . . " + this.state.addAdminAddress});
  await contract.methods.addAdmin(this.state.addAdminAddress).send({ from: accounts[0] });
  this.setState({ message: "Added admin address: " + this.state.addAdminAddress });
  this.setState({ addAdminAddress: '' });
  
}

revokeAdmin = async (event) => {
  event.preventDefault();
  console.log("Revoking admin . . . " + this.state.addRevokeAddress);
  this.setState({ message: "Revoking admin . . . " + this.state.addRevokeAddress});
  const { contract, accounts } = this.state;
  await contract.methods.revokeAdmin(this.state.addRevokeAddress).send({ from: accounts[0] });
  this.setState({ message: "Revoked admin address: " + this.state.addRevokeAddress });
  this.setState({ addRevokeAddress: '' });
}

addStoreOwner = async (event) => {
  event.preventDefault();
  console.log("Adding store owner . . . " + this.state.addStoreOwnerAddress);
  this.setState({ message: "Adding store owner . . . " + this.state.addStoreOwnerAddress});
  const { contract, accounts } = this.state;
  await contract.methods.addStoreOwner(this.state.addStoreOwnerAddress).send({ from: accounts[0] });
  this.setState({ message: "Added store owner: " + this.state.addStoreOwnerAddress });
  this.setState({ addStoreOwnerAddress: '' });
}

revokeStoreOwner = async (event) => {
  event.preventDefault();
  console.log("Revoking store owner . . . " + this.state.revokeStoreOwnerAddress);
  this.setState({ message: "Revoking store owner . . . " + this.state.revokeStoreOwnerAddress});
  const { contract, accounts } = this.state;
  await contract.methods.revokeStoreOwner(this.state.revokeStoreOwnerAddress).send({ from: accounts[0] });
  this.setState({ message: "Revoking store owner: " + this.state.revokeStoreOwnerAddress });
  this.setState({ revokeStoreOwnerAddress: '' });
}

addStore = async (event) => {
  event.preventDefault();
  const { lastStoreId, contract, accounts } = this.state;
  this.setState({ message: "Adding new store . . . " + this.state.addStoreName});
  console.log("Adding a new store: " )
  await contract.methods.addStore(this.state.addStoreName).send({from: accounts[0]});
  this.setState({ message: "Added store " + this.state.addStoreName });
  console.log("Recording the lastStoreId before incrementing in addStore: " + lastStoreId);
  let newLastStoreId = Number(lastStoreId)+1;
  console.log("Recording the lastStoreId after incrementing in addStore: " + newLastStoreId);
  this.setState({ addStoreName: '', lastStoreId: newLastStoreId });
  this.updateStoreList();
}

selectAStoreOnClick(store) {
  //event.preventDefault();
  const { lastStoreId } = this.state;
  console.log("Switching view to store id " + store.id);
  if (Number(store.id) <= lastStoreId)
  { 
    let selectedName = store.name;
    this.setState({storeSelected: selectedName, storeSelectedId: store.id})
    this.generateItemList(Number(store.id));
  }
}

generateItemList = async (storeToGetFrom) => {
  const { storeList, contract } = this.state;
  console.log("Regenerating item list for store #" + storeToGetFrom);
  let highItemId = await contract.methods.getItemCount(storeToGetFrom).call();
  console.log("Got highest Item id: " + highItemId + " for Store id: " + highItemId);
  // get more recent store funds amount
  let currentlySelectedStore = await contract.methods.fetchStore(storeToGetFrom).call();
  let newStoreSelectedFunds = Number(currentlySelectedStore.funds);
  console.log("Loaded store funds available: " + newStoreSelectedFunds);
  let newStoreSelectedOwner = storeList[storeToGetFrom].isStoresOwner;
  var newItemList = [];
  var i;
    for (i = 0; i <= highItemId; i++) {
      let newItem = await contract.methods.fetchItem(storeToGetFrom,i).call();
      if (!((newItem.price) === "0" && (newItem.quantity === "0"))) {
        newItemList.push(newItem);
      }
      console.log("loaded Item id: " + i + " from Store id: " + storeToGetFrom + ", Name: " + newItem.name + ", Price: " + newItem.price + ", Quantity: " + newItem.quantity);
    }
  this.setState({itemList: newItemList, storeSelectedOwner: newStoreSelectedOwner, storeSelectedId: storeToGetFrom, storeHighItemId: highItemId, storeSelectedFunds: newStoreSelectedFunds});
}

handleInputChange(event) {
  const target = event.target;
  const value = target.value;
  const name = target.name;

  this.setState({
    [name]: value
  });
}

addStoreItem = async (event) => {
  event.preventDefault();
  const { contract, accounts, storeSelectedId, addItemName, addItemPrice, addItemQuantity } = this.state;
  let newItemInfo = "Store Id: " + storeSelectedId + ", Name: " + addItemName + ", Price: " + addItemPrice + ", Quantity: " + addItemQuantity;
  let newMessage = "Adding new store item . . . " + newItemInfo;
  this.setState({ message: newMessage});
  console.log(newMessage);
  await contract.methods.addStoreItem(storeSelectedId, addItemName, addItemPrice, addItemQuantity).send({from: accounts[0]});
  this.setState({ message: "Added store item - " + newItemInfo});
  console.log("Added store item - " + newItemInfo);
  this.generateItemList(storeSelectedId);
  this.setState({addItemName: '', addItemPrice: '', addItemQuantity: ''})
}

deleteStoreItem = async (event) => {
  event.preventDefault();
  const { contract, accounts, storeSelectedId, deleteItemId, storeHighItemId} = this.state;
  if (Number(deleteItemId) > storeHighItemId)
  {
    let failureMessage = "Can't remove Item id: " + deleteItemId + " from Store id: " + storeSelectedId + ". No such item to delete.";
    this.setState({ message: failureMessage});
    console.log(failureMessage);
  }
  else {
    let newMessage = "Removing Item id: " + deleteItemId + " from Store id: " + storeSelectedId + ".";
    this.setState({ message: newMessage});
    console.log(newMessage);
    await contract.methods.removeStoreItem(storeSelectedId, deleteItemId).send({from: accounts[0]});
    newMessage = "Removed Item id: " + deleteItemId + " from Store id: " + storeSelectedId + ".";
    this.setState({ message: newMessage});
    console.log(newMessage);
    this.generateItemList(storeSelectedId);
    this.setState({ deleteItemId: ''});
  }
}

changeItemPrice = async (event) => {
  event.preventDefault();
  const { contract, accounts, storeSelectedId,  changeItemPriceId, changeItemNewPrice} = this.state;
  let newMessage = "Changing Item id: " + changeItemPriceId + " price to:  " + changeItemNewPrice + " wei.";
  this.setState({ message: newMessage});
  console.log(newMessage);
  await contract.methods.changeItemPrice(storeSelectedId, changeItemPriceId, changeItemNewPrice).send({from: accounts[0]});
  newMessage  = "Changed Item id: " + changeItemPriceId + " price to:  " + changeItemNewPrice + " wei.";
  this.setState({ message: newMessage});
  console.log(newMessage);
  this.generateItemList(storeSelectedId);
  this.setState({ changeItemPriceId: '', changeItemNewPrice: ''})
}

buyItemOnClick = async (item) => {
  const { contract, accounts, storeSelectedId, web3} = this.state;
  let newMessage = "Purchasing Item id: " + item.id + " for  " + item.price + " wei.";
  this.setState({ message: newMessage});
  console.log(newMessage);
  await contract.methods.buyStoreItem(storeSelectedId, item.id).send({from: accounts[0],
      value: web3.utils.toWei(item.price, 'wei')});
  newMessage = "Purchased Item id: " + item.id + " for  " + item.price + " wei.";
  this.setState({ message: newMessage});
  console.log(newMessage);
  this.generateItemList(storeSelectedId);
  this.updateStoreList();
  let smartContractBalance = await web3.eth.getBalance(contract.options.address);
  console.log("The smart contract balance is now: " + smartContractBalance);
}

withdrawFunds = async (event) => {
  event.preventDefault();
  const { contract, accounts, storeSelectedId, changeWithdraw, storeList} = this.state;
  let newMessage = "Withdrawing the store funds for store id #:" + storeSelectedId + ". Trying to withdraw " + changeWithdraw + " wei."
  this.setState({ message: newMessage});
  console.log(newMessage);
  await contract.methods.withdrawStoreFunds(storeSelectedId,changeWithdraw).send({from: accounts[0]});
  newMessage = "Withdrew the store funds for store id #:" + storeSelectedId;
  this.setState({ message: newMessage});
  console.log(newMessage);
  // update the amount of funds displayed:
  let currentlySelectedStore = await contract.methods.fetchStore(storeSelectedId).call();
  let newStoreSelectedFunds = Number(currentlySelectedStore.funds);
  let newStoreList = storeList;
  newStoreList[storeSelectedId].funds = newStoreSelectedFunds;
  this.setState({ storeList: newStoreList, storeSelectedFunds: newStoreSelectedFunds});
}

render() {
  if (!this.state.web3) {
    return <div>Loading Web3, accounts, and contract...</div>;
  }

  return (
    <div className="App">
      <h1>Online Marketplace</h1>
      <p>Your Account: {this.state.accounts[0]}</p>
      <p>{this.state.message}</p>
      <div className="adminOptions">
      {
        (() => {
        if (this.state.isAdmin) return (
      <div>
      <h2>Administration menu</h2>
      <form>
          <input name="addAdminAddress" type="text" placeholder="Address to add as admin" style={{width: "320px"}}
          onChange={this.handleInputChange}
          value={this.state.addAdminAddress}
          />&nbsp;&nbsp;
      <button type="submit" onClick={this.addAdmin}>Add Admin</button>
      </form>
      <form>
          <input name="addRevokeAddress" type="text" placeholder="Address to revoke as admin" style={{width: "320px"}}
          onChange={this.handleInputChange}
          value={this.state.addRevokeAddress}/>&nbsp;&nbsp;
      <button type="submit" onClick={this.revokeAdmin}>Revoke Admin</button>
      </form>
      <form>
          <input name="addStoreOwnerAddress" type="text" placeholder="Address to add as a Store Owner" style={{width: "320px"}}
          onChange={this.handleInputChange}
          value={this.state.addStoreOwnerAddress}/>&nbsp;&nbsp;
      <button type="submit" onClick={this.addStoreOwner}>Add Store Owner</button>
      </form>
      <form>
          <input name="revokeStoreOwnerAddress" type="text" placeholder="Address to remove as a Store Owner" style={{width: "320px"}}
          onChange={this.handleInputChange}
          value={this.state.revokeStoreOwnerAddress}/>&nbsp;&nbsp;
      <button type="submit" onClick={this.revokeStoreOwner}>Remove Store Owner</button>
      </form>
      
    </div> 
        )})()
      }
      </div>

      <div className="storeOwnerOptions">
      {
        (() => {
        if (this.state.isStoreOwner) return (
        <div>
        <h2>Store Owner Menu</h2>
        <form>
          <input name="addStoreName" type="text" placeholder="Name of new store" 
          onChange={this.handleInputChange}
          value={this.state.addStoreName}/>&nbsp;&nbsp;
      <button type="submit" onClick={this.addStore}>Add Store</button>
      </form>
    </div>

      )})()
      }
      </div>
      <div className="debuggingInformation">
      {
        (() => {
        if (this.state.displayDebuggingInfo) return (
          <div>
            <h2>Debugging information:</h2>
            <p>isAdmin value is: {String(this.state.isAdmin)}</p>
            <p>isStoreOwner value is: {String(this.state.isStoreOwner)}</p>
            <p>lastStoreId value is: {String(this.state.lastStoreId)}. There are {String(Number(this.state.lastStoreId)+1)} stores total.</p>
          </div>
        )})()
      }
      </div>
      <h2>Stores listing: </h2>
      <div className="container">
      <table>
      <tbody>
        <tr>
          <td width="30"><strong>Id</strong></td>
          <td><strong>Name</strong></td>
          <td><strong>High Item Id</strong></td>
          <td><strong>Store Owner</strong></td>
          <td><strong>Owner?</strong></td>
          <td><strong>Funds</strong></td>
          <td></td>
        </tr>
  {this.state.storeList.map((store) => {
    return [
       //<tr key={i} onClick={toggleOpen.bind(this, i)}>
       <tr key={store.id}>
          <td>#<strong>{store.id}</strong></td>
          <td>{store.name}</td>
          <td>{store.highItemId}</td>
          <td>{store.owner}</td>
          <td>{String(store.isStoresOwner)}</td>
          <td>{String(store.funds)} wei</td>
          <td><button onClick={this.selectAStoreOnClick.bind(this, store)}>Select</button></td>
        </tr>
    ];
  })}
</tbody></table></div>
      <p><strong>Currently displaying store #{this.state.storeSelectedId}:</strong> {this.state.storeSelected}</p>
      <div className="itemList">
      {
        (() => {
        if (this.state.itemList.length > 0 ) return (
          <div>
          <div className="container">
          <table><tbody>
            <tr>
            <td width="30"><strong>Id</strong></td>
            <td><strong>Name</strong></td>
            <td><strong>Price</strong></td>
            <td><strong>Quantity</strong></td>
            <td></td>
          </tr>
          {this.state.itemList.map((item) => {
            return [
              //<tr key={i} onClick={toggleOpen.bind(this, i)}>
              <tr key={item.id}>
                  <td>#<strong>{item.id}</strong></td>
                  <td>{item.name}</td>
                  <td>{item.price} wei</td>
                  <td>{item.quantity}</td>
                  <td><button onClick={this.buyItemOnClick.bind(this, item)}>Buy</button></td>
                </tr>
              ];
          })}
          </tbody></table>
          </div>
          </div>
      )
      else if(Number(this.state.selectAStore) <= this.state.lastStoreId && this.state.storeSelectedId != null) return (
        <div className="container">
          <p>Store has no items yet.</p>
          </div>
      )
      })()
      }
      </div>
      <br />
      <div className="specificStoreOwnerOptions">
      {
        (() => {
        if (this.state.storeSelectedOwner) return (
          <div>
            <div className="container">
            <form>
              <input name="addItemName" type="text" placeholder="New Item Name" style={{width: "320px"}}
              onChange={this.handleInputChange}
              value={this.state.addItemName}/>&nbsp;&nbsp;
              <input name="addItemPrice" type="number" placeholder="Price" style={{width: "250px"}}
              onChange={this.handleInputChange}
              value={this.state.addItemPrice}/>&nbsp;&nbsp;
              <input name="addItemQuantity" type="number" placeholder="Quantity" style={{width: "75px"}}
              onChange={this.handleInputChange}
              value={this.state.addItemQuantity}/>&nbsp;&nbsp;
              <button type="submit" onClick={this.addStoreItem}>Add New Item</button>
            </form>&nbsp;&nbsp;&nbsp;&nbsp;<br/>
            </div>
            <br />
            <div className="container">
            <form>
            <input name="deleteItemId" type="number" placeholder="Id to delete" style={{width: "100px"}}
              onChange={this.handleInputChange}
              value={this.state.deleteItemId}/>&nbsp;&nbsp;
              <button type="submit" onClick={this.deleteStoreItem}>Delete item</button>
            </form>
            </div>
            <br />
            <div className="container">
            <form>
            <input name="changeItemPriceId" type="number" placeholder="Id to change" style={{width: "100px"}}
              onChange={this.handleInputChange}
              value={this.state.changeItemPriceId}/>&nbsp;&nbsp;
            <input name="changeItemNewPrice" type="number" placeholder="New price" style={{width: "250px"}}
              onChange={this.handleInputChange}
              value={this.state.changeItemNewPrice}/>&nbsp;&nbsp;
              <button type="submit" onClick={this.changeItemPrice}>Change price</button>
            </form>
            </div>
            <br />
            <div className="container">
            <form>
              Funds available for withdraw: {String(this.state.storeSelectedFunds)} wei&nbsp;&nbsp;
              <br/>
              <input name="changeWithdraw" type="number" placeholder="Amount to withdraw" style={{width: "250px"}}
              onChange={this.handleInputChange}
              value={this.state.changeWithdraw}/>&nbsp;&nbsp;
              <button type="submit" onClick={this.withdrawFunds}>Withdraw store funds</button>
            </form>
            </div>
            <br />
          </div>
      )
      })()
      }
      </div>
    </div>
    );
}

} // end App


export default App;
