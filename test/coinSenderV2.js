const {ethers, upgrades} = require('hardhat');
const {expect} = require('chai');
const {BigNumber} = require("ethers");
const hre = require("hardhat");


describe("Start Test", function () {

    let contract, CoinSender, token;
    let owner, newOwner, addr1, addr2;

    beforeEach(async () => {
        [owner, newOwner, addr1, addr2] = await ethers.getSigners();

        CoinSender = await hre.ethers.getContractFactory('CoinSender');

        contract = await upgrades.deployProxy(CoinSender, [
            owner.address,
        ]);

    });

    describe("Read Methods Test", function () {

        it("Check percent", async () => {
            expect(await contract.percent()).to.equal(10);
        })

        it("Check bank", async () => {
            await expect(await contract.bank()).to.equal(owner.address);
        })
    })

    describe("Change params", function () {

        it("Change percent", async () => {
            await contract.changePercentage(20);
            await expect(await contract.percent()).to.equal(20);
        })

        it("Change bank", async () => {
            await contract.changeBankAddress(owner.address);
            await expect(await contract.bank()).to.equal(owner.address);
        })

    })

    describe("Send Money", function () {

        it("Send ETH", async () => {
            const balanceETH = await ethers.provider.getBalance(owner.address)
            await contract.multiSendDiffEth([owner.address], [ethers.utils.formatUnits(1, "wei")], {value: ethers.utils.formatUnits(1, "wei")});
        })

        it("Send TOKENS", async () => {
            const balanceETH = await ethers.provider.getBalance(owner.address)
            await contract.multiSendDiffEth([owner.address], [ethers.utils.formatUnits(1, "wei")], {value: ethers.utils.formatUnits(1, "wei")});
        })

    })

    describe("Check reverts", function () {

        it("Send ETH with different length", async () => {
            await expect(contract.multiSendDiffEth([owner.address, owner.address], [ethers.utils.formatUnits(2, "wei")], {value: ethers.utils.formatUnits(1, "wei")})).to.be.reverted;
        })

        it("Send ETH with Low balance", async () => {
            await expect(contract.multiSendDiffEth([owner.address], [ethers.utils.formatUnits(100, "wei")], {value: ethers.utils.formatUnits(20, "wei")})).to.be.reverted;
        })

        it("Send ETH with zero amount", async () => {
            await expect(contract.multiSendDiffEth([owner.address], [0], {value: ethers.utils.formatUnits(1, "wei")})).to.be.reverted;
        })

        it("Send ETH with amount more then payable", async () => {
            await expect(contract.multiSendDiffEth([owner.address], [ethers.utils.formatUnits(10000, "wei")], {value: ethers.utils.formatUnits(1, "wei")})).to.be.reverted;
        })

        it("Send ETH with empty recipients", async () => {
            await expect(contract.multiSendDiffEth([], [ethers.utils.formatUnits(1, "wei")], {value: ethers.utils.formatUnits(1, "wei")})).to.be.reverted;
        })
    })
})








