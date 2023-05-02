const {ethers, upgrades} = require('hardhat');
const {expect} = require('chai');
const {BigNumber} = require("ethers");
const hre = require("hardhat");
const {loadFixture} = require("@nomicfoundation/hardhat-network-helpers");


async function main() {

    async function getFactories(owner) {
        let factories = {};

        factories.CoinSenderV1_0 = await ethers.getContractFactory(
            "CoinSenderV1_0",
            owner
        );


        factories.CoinSenderV1_1 = await ethers.getContractFactory(
            "CoinSenderV1_1",
            owner
        );

        factories.CoinSender = await ethers.getContractFactory(
            "CoinSender",
            owner
        );
        return factories;
    }

    const [owner, addr1, addr2] = await ethers.getSigners();

    const contracts = {};
    contracts.factories = await getFactories(owner);

    const CoinSenderV1_0 = contracts.CoinSenderV1_0 = await upgrades.deployProxy(
        contracts.factories.CoinSenderV1_0,
        {
            initializer: "initialize",
            kind: "uups",
        }
    );

    await contracts.CoinSenderV1_0.deployed();

    const CoinSenderV1_1 = contracts.CoinSenderV1_1 = await upgrades.deployProxy(
        contracts.factories.CoinSenderV1_1,
        {
            initializer: "initialize",
            kind: "uups",
        }
    );

    await contracts.CoinSenderV1_1.deployed();

    const CoinSender = contracts.CoinSenderV1_2 = await upgrades.deployProxy(
        contracts.factories.CoinSender,
        {
            initializer: "initialize",
            kind: "uups",
        }
    );

    const contract = await contracts.CoinSenderV1_2.deployed();


    return {contract, CoinSender, owner, addr1, addr2};
}


describe("Read Methods Test", function () {

    it("Check percent", async () => {
        const {contract} = await loadFixture(main);
        expect(await contract.percent()).to.equal(10);
    })

    it("Check bank", async () => {
        const {contract} = await loadFixture(main);
        await expect(await contract.bank()).to.equal('0x3Ff0Dc6514d719152692188bD6F0771ADe370852');
    })
})

describe("Change params", function () {

    it("Change percent", async () => {
        const {contract} = await loadFixture(main);
        await contract.changePercentage(20);
        await expect(await contract.percent()).to.equal(20);
    })

    it("Change bank", async () => {
        const {contract, owner} = await loadFixture(main);
        await contract.changeBankAddress(owner.address);
        await expect(await contract.bank()).to.equal(owner.address);
    })

})

describe("Send Money", function () {

    it("Send ETH", async () => {
        const {contract, owner} = await loadFixture(main);
        const balanceETH = await ethers.provider.getBalance(owner.address)
        await contract.multiSendDiffEth([owner.address], [ethers.utils.formatUnits(1, "wei")], {value: ethers.utils.formatUnits(1, "wei")});
    })
    //TODO: Connect token

    it("Send TOKENS", async () => {
        const {contract, owner} = await loadFixture(main);
        const balanceETH = await ethers.provider.getBalance(owner.address)
        await contract.multiSendDiffEth([owner.address], [ethers.utils.formatUnits(1, "wei")], {value: ethers.utils.formatUnits(1, "wei")});
    })

})

describe("Check reverts", function () {



    it("Send ETH with different length", async () => {
        const {contract, owner} = await loadFixture(main);
        await expect(contract.multiSendDiffEth([owner.address, owner.address], [ethers.utils.formatUnits(2, "wei")], {value: ethers.utils.formatUnits(1, "wei")})).to.be.reverted;
    })

    it("Send ETH with Low balance", async () => {
        const {contract, owner} = await loadFixture(main);
        await expect(contract.multiSendDiffEth([owner.address], [ethers.utils.formatUnits(100, "wei")], {value: ethers.utils.formatUnits(20, "wei")})).to.be.reverted;
    })

    it("Send ETH with zero amount", async () => {
        const {contract, owner} = await loadFixture(main);
        await expect(contract.multiSendDiffEth([owner.address], [0], {value: ethers.utils.formatUnits(1, "wei")})).to.be.reverted;
    })

    it("Send ETH with amount more then payable", async () => {
        const {contract, owner} = await loadFixture(main);
        await expect(contract.multiSendDiffEth([owner.address], [ethers.utils.formatUnits(10000, "wei")], {value: ethers.utils.formatUnits(1, "wei")})).to.be.reverted;
    })

    it("Send ETH with empty recipients", async () => {
        const {contract} = await loadFixture(main);
        await expect(contract.multiSendDiffEth([], [ethers.utils.formatUnits(1, "wei")], {value: ethers.utils.formatUnits(1, "wei")})).to.be.reverted;
    })


    it("upgrade contract v1.0 to v1.1 check", async () => {
        const contracts = await loadFixture(main);
        const contractV1_1 = await ethers.getContractFactory("CoinSenderV1_1");
        const contractV1_2 = await ethers.getContractFactory("CoinSender");

        let coinSender;

        coinSender = await upgrades.upgradeProxy(
            contracts.CoinSender.address,
            contractV1_1
        );

        await coinSender.deployed();

        coinSender = await upgrades.upgradeProxy(
            coinSender.address,
            contractV1_2
        );

        await coinSender.deployed();
    });


})
