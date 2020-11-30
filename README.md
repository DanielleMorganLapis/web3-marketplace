For Consensys Academy Developer Bootcamp 2020

Online Marketplace
Description: Create an online marketplace that operates on the blockchain.
 
There are a list of stores on a central marketplace where shoppers can purchase goods posted by the store owners.
 
The central marketplace is managed by a group of administrators. Admins allow store owners to add stores to the marketplace. Store owners can manage their store’s inventory and funds. Shoppers can visit stores and purchase goods that are in stock using cryptocurrency. 
 
User Stories:
An administrator opens the web app. The web app reads the address and identifies that the user is an admin, showing them admin only functions, such as managing store owners. An admin adds an address to the list of approved store owners, so if the owner of that address logs into the app, they have access to the store owner functions.
 
An approved store owner logs into the app. The web app recognizes their address and identifies them as a store owner. They are shown the store owner functions. They can create a new storefront that will be displayed on the marketplace. They can also see the storefronts that they have already created. They can click on a storefront to manage it. They can add/remove products to the storefront or change any of the products’ prices. They can also withdraw any funds that the store has collected from sales.
 
A shopper logs into the app. The web app does not recognize their address so they are shown the generic shopper application. From the main page they can browse all of the storefronts that have been created in the marketplace. Clicking on a storefront will take them to a product page. They can see a list of products offered by the store, including their price and quantity. Shoppers can purchase a product, which will debit their account and send it to the store. The quantity of the item in the store’s inventory will be reduced by the appropriate amount.

/client/src/App.js - the front end
/contracts/ - Solidity contracts
/test/marketplace.test.js - 12 tests for marketplace contract and the manageable interface

used with:
node v12.18.4 (npm v6.14.6)
Truffle v5.1.46
solcjs 0.5.16
ganache-cli v6.10.2 (ganache-core: 2.11.3)

Place .secret file in root with 12 words for the private key.
Run: ganache-cli -m, followed by the 12 words between "" to start the local chain with those keys
Run: truffle migrate to deploy the contracts to the local chain
Run: npm start dev in client/src/
First account starts with 2 stores, admin and store owner access. There is a limit of 16 stores.