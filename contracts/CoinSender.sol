// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract CoinSender is ReentrancyGuard, AccessControl {
    using SafeERC20 for IERC20;

    string public constant name = "CoinSender";

    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    uint256 public constant MAX_PERCENT = 1000;  // 10%

    uint256 public percent;
    address public bank;

    constructor(uint256 _percent, address _bank, address _timeLockController, address _defaultOperator) {
        require(_bank != address(0), "Bank address is not be zero");
        require(_percent <= MAX_PERCENT, "Percentage cannot exceed maximum limit");
        require(_timeLockController != address(0), "Default admin address is not be zero");
        require(_defaultOperator != address(0), "Default admin address is not be zero");

        percent = _percent;
        bank = _bank;

        _setupRole(DEFAULT_ADMIN_ROLE, _timeLockController);
        _setupRole(OPERATOR_ROLE, _defaultOperator);
    }

    receive() external payable {}

    function multiSendDiffEth(
        address[] calldata recipients,
        uint256[] calldata amounts,
        bytes calldata signature
    ) external payable nonReentrant {
        require(msg.value > 0, "Invalid amount");
        require(recipients.length > 0, "Recipients list is empty");
        require(
            recipients.length == amounts.length,
            "Lengths of recipients and amounts arrays do not match"
        );

        verifySignature(recipients, amounts, signature);

        (uint256 taxes, uint256 totalSum) = calculateTotalAmountTaxes(recipients, amounts);

        uint256 totalAmount = totalSum + taxes;

        require(totalAmount < msg.value, 'Low balance');

        for (uint256 i = 0; i < recipients.length; i++) {
            require(amounts[i] > 0, "Value must be more than 0");
            require(recipients[i] != address(0), "Recipient must be not zero address");

            payable(recipients[i]).transfer(amounts[i]);
        }

        payable(bank).transfer(taxes);

        // Return the remaining balance, if any
        uint256 remainingBalance = msg.value - totalAmount;
        if (remainingBalance > 0) {
            payable(msg.sender).transfer(remainingBalance);
        }
    }

    function changePercentage(uint256 _percent) public {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Caller is not an admin");
        require(_percent <= MAX_PERCENT, "Percentage cannot exceed maximum limit");
        percent = _percent;
    }

    function changeBankAddress(address _bank) public {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Caller is not an admin");
        require(_bank != address(0), "Bank address is not be zero");
        bank = _bank;
    }

    function multiSendDiffToken(
        address[] calldata recipients,
        uint256[] calldata amounts,
        address token,
        bytes calldata signature
    ) external nonReentrant {
        require(recipients.length > 0, "Recipients list is empty");
        require(recipients.length == amounts.length, "Lengths of recipients and amounts arrays do not match");

        verifySignature(recipients, amounts, signature);

        (uint256 taxes, uint256 totalSum) = calculateTotalAmountTaxes(recipients, amounts);

        uint256 totalAmount = totalSum + taxes;

        IERC20 tokenInstance = IERC20(token);

        require(totalAmount <= tokenInstance.balanceOf(msg.sender), 'Low balance');
        require(totalAmount <= tokenInstance.allowance(msg.sender, address(this)), 'Low allowance');

        for (uint256 i = 0; i < recipients.length; i++) {
            require(amounts[i] > 0, "Value must be more than 0");
            require(recipients[i] != address(0), "Recipient must be not zero address");

            tokenInstance.safeTransferFrom(msg.sender, recipients[i], amounts[i]);
        }

        tokenInstance.safeTransferFrom(msg.sender, bank, taxes);
    }

    function calculateTotalAmountTaxes(
        address[] calldata recipients,
        uint256[] calldata amounts
    ) public view returns(uint256 taxes, uint256 totalSum) {
        totalSum = 0;
        taxes = 0;

        uint256 arrayLength = recipients.length;
        for (uint256 i = 0; i < arrayLength; i++) {
            uint256 fee = amounts[i] * percent / 10000;
            totalSum = totalSum + amounts[i];
            taxes = taxes + fee;
        }
    }

    function verifySignature(address[] memory recipients, uint256[] memory amounts, bytes memory signature) internal view {
        bytes32 hash = keccak256(abi.encodePacked(recipients, amounts));
        bytes32 messageHash = getEthSignedMessageHash(hash);

        address signer = recoverSigner(messageHash, signature);
        require(hasRole(OPERATOR_ROLE, signer), "Signature is not valid");
    }

    function getEthSignedMessageHash(bytes32 _messageHash) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", _messageHash));
    }

    function recoverSigner(bytes32 _ethSignedMessageHash, bytes memory _signature) internal pure returns (address) {
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(_signature);

        return ecrecover(_ethSignedMessageHash, v, r, s);
    }

    function splitSignature(bytes memory sig) internal pure returns (bytes32 r, bytes32 s, uint8 v) {
        require(sig.length == 65, "Invalid signature length");

        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }
    }

    function grantRole(bytes32 role, address account) public virtual override {
        require(role != DEFAULT_ADMIN_ROLE, "CoinSender: Cannot change or add default admin role");

        super.grantRole(role, account);
    }
}
