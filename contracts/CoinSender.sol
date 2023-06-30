// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

// import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";


contract CoinSender is UUPSUpgradeable, OwnableUpgradeable, ReentrancyGuardUpgradeable {
    using SafeERC20Upgradeable for IERC20Upgradeable;

    string public constant name = "CoinSender";

    uint256 public percent;
    address public bank;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() { }

    function _authorizeUpgrade(address newImplementation)
    internal
    virtual
    override
    onlyOwner
    {}

    function initialize(address _owner) public initializer {
        require(_owner != address(0), "Owner address is not set");

        __Ownable_init();
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();

        transferOwnership(_owner);

        percent = 10; // 0.1%
        bank = _owner;
    }

    receive() external payable {}

    function changePercentage(uint256 _percent) public onlyOwner {
        require(_percent < 10000, "Bigger than amount");
        percent = _percent;
    }

    function changeBankAddress(address _bank) public onlyOwner {
        require(_bank != address(0), "Bank address is not be zero");
        bank = _bank;
    }

    function multiSendDiffEth(
        address[] memory recipients,
        uint256[] memory amounts
    ) public payable nonReentrant {
        require(msg.value > 0, "Invalid amount");
        require(recipients.length > 0, "Recipients list is empty");
        require(
            recipients.length == amounts.length,
            "Lengths of recipients and amounts arrays do not match"
        );

        (uint256 taxes, uint256 totalSum) = calculateTotalAmountTaxes(recipients, amounts);

        uint256 totalAmount = totalSum.add(taxes);

        require(totalAmount <= msg.value, 'Low balance');

        for (uint256 i = 0; i < recipients.length; i++) {
            require(amounts[i] > 0, "Value must be more than 0");
            require(recipients[i] != address(0), "Recipient must be not zero address");

            payable(recipients[i]).transfer(amounts[i]);
        }

        payable(bank).transfer(taxes);

        // Return the remaining balance, if any
        uint256 remainingBalance = msg.value.sub(totalAmount);
        if (remainingBalance > 0) {
            payable(msg.sender).transfer(remainingBalance);
        }
    }

    function multiSendDiffToken(
        address[] calldata recipients,
        uint256[] calldata amounts,
        address token
    ) external nonReentrant {
        require(recipients.length > 0, "Recipients list is empty");
        require(recipients.length == amounts.length, "Lengths of recipients and amounts arrays do not match");

        (uint256 taxes, uint256 totalSum) = calculateTotalAmountTaxes(recipients, amounts);

        uint256 totalAmount = totalSum.add(taxes);

        IERC20Upgradeable tokenInstance = IERC20Upgradeable(token);

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
    ) public pure returns(uint256 taxes, uint256 totalSum) {
        totalSum = 0;
        taxes = 0;
        uint256 arrayLength = recipients.length;
        for (uint256 i = 0; i < arrayLength; i++) {
            uint256 fee = amounts[i] * percent / 10000;
            totalSum = totalSum + amounts[i];
            taxes = taxes + fee;
        }
    }

    uint256[49] private __gap;
}
