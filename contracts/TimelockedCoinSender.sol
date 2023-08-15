// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/governance/TimelockController.sol";
import "./CoinSender.sol";

contract CoinSenderTimelockManager is TimelockController {

    CoinSender public coinSender;
    uint256 private minDelay = 2 days;

    constructor(
        address[] memory proposers,
        address[] memory executors,
        address admin,
        uint256 _percent,
        address _bank,
        address _defaultOperator
    ) TimelockController(minDelay, proposers, executors, admin) {
        coinSender = new CoinSender(_percent, _bank, address(this), _defaultOperator);
    }
}
