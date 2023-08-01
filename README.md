# CoinSender

CoinSender is a smart contract that allows you to send Ether or any ERC20 tokens to multiple addresses in a single transaction.

### Installation

1. Clone the repo
```sh
git clone https://github.com/YourGithubUsername/CoinSender.git
```
2. Install NPM packages
```sh
 npm install
 ```
3. Rename `.env.example` to `.env` and fill in the required values.

## Deployment

### Compile the Contract

Before deploying, compile the contract using:

```sh
npx hardhat compile
```

### Run Deployment Script

You can deploy your contract on the Hardhat network by running a deployment script with:

```sh
npx hardhat run --network hardhat scripts/deploy.js
```

## Usage

After deploying the contract, you need to assign roles to the accounts that will be allowed to use the contract. Only the default admin account (which was set in the constructor during deployment) can assign roles.

### Assign a Role

To assign a role to an account, use the `grantRole` function. The function signature is:

```solidity
function grantRole(bytes32 role, address account) public virtual;
```

This function can be called like this:

```javascript
await contractInstance.methods.grantRole(OPERATOR_ROLE, '0xYourAccountAddress').send({ from: adminAccount });
```

In this example, replace `'0xYourAccountAddress'` with the Ethereum address that will be assigned the role, and `adminAccount` with the Ethereum address of the admin account.

### Revoke a Role

To revoke a role from an account, use the `revokeRole` function. The function signature is:

```solidity
function revokeRole(bytes32 role, address account) public virtual;
```

This function can be called like this:

```javascript
await contractInstance.methods.revokeRole(OPERATOR_ROLE, '0xYourAccountAddress').send({ from: adminAccount });
```

In this example, replace `'0xYourAccountAddress'` with the Ethereum address from which the role will be revoked, and `adminAccount` with the Ethereum address of the admin account.

## Contract Interaction

To interact with the contract, you need to use the Web3.js library. Below is an example of how to use Web3.js to call the `multiSendDiffEth` and `multiSendDiffToken` functions.

### Initializing Web3

```javascript
const Web3 = require('web3');
const web3 = new Web3('https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID');

const contractABI = [/* ABI of your contract */];
const contractAddress = '0xYourContractAddress';

const contract = new web3.eth.Contract(contractABI, contractAddress);

```

### Sending Ether

```javascript
const recipients = ['0xRecipient1', '0xRecipient2'];
const amounts = [web3.utils.toWei('0.1', 'ether'), web3.utils.toWei('0.2', 'ether')];

const hash = web3.utils.soliditySha3({ type: 'address[]', value: recipients }, { type: 'uint256[]', value: amounts });
const account = web3.eth.accounts.privateKeyToAccount('0xYourPrivateKey');
const signature = account.sign(hash);

const gasEstimate = await contract.methods.multiSendDiffEth(recipients, amounts, signature).estimateGas({ value: web3.utils.toWei('0.3', 'ether') });
const transaction = contract.methods.multiSendDiffEth(recipients, amounts, signature).send({ from: account.address, gas: gasEstimate, value: web3.utils.toWei('0.3', 'ether') });
transaction.on('transactionHash', console.log);
```

### Sending Tokens

To send ERC20 tokens to multiple addresses, follow these steps:

```javascript
const recipients = ['0xRecipient1', '0xRecipient2'];
const amounts = [web3.utils.toWei('0.1', 'ether'), web3.utils.toWei('0.2', 'ether')];
const tokenAddress = '0xYourTokenAddress';
const hash = web3.utils.soliditySha3({ type: 'address[]', value: recipients }, { type: 'uint256[]', value: amounts });
const account = web3.eth.accounts.privateKeyToAccount('0xYourPrivateKey');
const signature = account.sign(hash);

const gasEstimate = await contract.methods.multiSendDiffToken(recipients, amounts, tokenAddress, signature).estimateGas();
const transaction = contract.methods.multiSendDiffToken(recipients, amounts, tokenAddress, signature).send({ from: account.address, gas: gasEstimate });

transaction.on('transactionHash', console.log);
```




