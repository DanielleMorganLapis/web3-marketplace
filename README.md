#### For Consensys Academy Developer Bootcamp 2020

# Online Marketplace
## Description: Create an online marketplace that operates on the blockchain.
 
There are a list of stores on a central marketplace where shoppers can purchase goods posted by the store owners.
 
The central marketplace is managed by a group of administrators. Admins allow store owners to add stores to the marketplace. Store owners can manage their store’s inventory and funds. Shoppers can visit stores and purchase goods that are in stock using cryptocurrency. 
 
User Stories:
An administrator opens the web app. The web app reads the address and identifies that the user is an admin, showing them admin only functions, such as managing store owners. An admin adds an address to the list of approved store owners, so if the owner of that address logs into the app, they have access to the store owner functions.
 
An approved store owner logs into the app. The web app recognizes their address and identifies them as a store owner. They are shown the store owner functions. They can create a new storefront that will be displayed on the marketplace. They can also see the storefronts that they have already created. They can click on a storefront to manage it. They can add/remove products to the storefront or change any of the products’ prices. They can also withdraw any funds that the store has collected from sales.
 
A shopper logs into the app. The web app does not recognize their address so they are shown the generic shopper application. From the main page they can browse all of the storefronts that have been created in the marketplace. Clicking on a storefront will take them to a product page. They can see a list of products offered by the store, including their price and quantity. Shoppers can purchase a product, which will debit their account and send it to the store. The quantity of the item in the store’s inventory will be reduced by the appropriate amount.

#### Directories

/client/src/App.js - the front end

/contracts/ - Solidity contracts

/test/marketplace.test.js - 12 tests for marketplace contract and the manageable interface

#### Used with:

node v12.18.4 (npm v6.14.6)

Truffle v5.1.46

solcjs 0.5.16

ganache-cli v6.10.2 (ganache-core: 2.11.3)

#### Instructions

##### Running locally

In the root directory, run:

```
ganache-cli
```

A list of accounts and private keys appears. Under the line below "HD Wallet", there is a Mnemonic of 12 words. Create a .secret file in the root directory of the project and copy and paste these 12 words into the .secret file and save.

If you need to cancel ganache-cli and re-run it, start ganache-cli -m, followed by the 12 words in the secret file between "" to start the local chain with those keys.

To deploy the contracts to the local chain that ganache-cli is running, open up a new terminal, then run:
```
truffle migrate
```

Run the tests with:
```
truffle test
```

To start the react app:
```
cd client/src
npm start dev
```

In Metamask, click on the icon in the upper-right, and select to "Import Account". In the terminal ganache-cli is running has a list of private keys, select the private key that is associated with account (0) and import into Metamask, this is the master admin account for the application.

Set up Metamask to connect to Custom RPC, have it connect in the browser to the 127.0.0.1 localhost, port 8545, on the react app tab, localhost:3000.

First account starts with 2 stores, admin and store owner access. There is a limit of 16 stores.

##### Connecting to rinkeby

Alternatively, you can connect and use the app on the rinkeby network, instead of running locally.

To start the react app:
```
cd client/src
npm start dev
```

In the web browser, on the localhost:3000 tab, select the Rinkeby Test Network to interact with the application.