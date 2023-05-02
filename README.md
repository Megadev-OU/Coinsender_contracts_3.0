# CoinSender

A smart contract for sending multiple transactions with different amounts of ETH or ERC20 tokens to specified recipients, with an additional fee for each transaction.

## Features

- Send multiple transactions with different amounts of ETH or ERC20 tokens to specified recipients.
- Automatically calculates the fees for each transaction.
- Supports changing the fee percentage and the address to which fees are sent (bank).

## Usage

1. Deploy the contract and set the initial bank address.
2. The owner can change the fee percentage and bank address using the `changePercentage` and `changeBankAddress` functions.
3. Use the `multiSendDiffEth` function to send multiple transactions with different amounts of ETH.
4. Use the `multiSendDiffToken` function to send multiple transactions with different amounts of ERC20 tokens.

## Functions

- `initialize(address _owner)`: Initializes the contract.
- `changePercentage(uint256 _percent)`: Changes the fee percentage.
- `changeBankAddress(address _bank)`: Changes the bank address.
- `multiSendDiffEth(address[] memory recipients, uint256[] memory amounts)`: Sends multiple transactions with different amounts of ETH.
- `multiSendDiffToken(address[] memory recipients, uint256[] memory amounts, address token)`: Sends multiple transactions with different amounts of ERC20 tokens.
- `calculateTotalAmountTaxes(address[] memory recipients, uint256[] memory amounts)`: Calculates the total amount of fees and the total sum sent.

## Dependencies

- [OpenZeppelin Contracts Upgradeable](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable)

## License

[MIT](./LICENSE)
