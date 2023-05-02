const { hre, ethers, upgrades } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");


async function main2() {

    async function getFactories(owner) {
        let factories = {};

        factories.CoinSender = await ethers.getContractFactory(
            "CoinSender",
            owner
        );
        return factories;
    }

    const [owner, addr1, addr2] = await ethers.getSigners();

    const contracts = {};
    contracts.factories = await getFactories(owner);

    const CoinSender = contracts.CoinSender = await upgrades.deployProxy(
        contracts.factories.CoinSender,
        {
            initializer: "initialize",
            kind: "uups",
        }
    );

    const contract = await contracts.CoinSender.deployed();

    return { contract, CoinSender, owner, addr1, addr2 };
}

async function main() {
    const oldContractAddress = "0x1bb79e75a062ff90F8E79FE281f41324C3052afc";
    const newContractAddress = "0x9B793EbE7353D2afcfa8f8310247aB4AF437cf96";
    const newContractFactoryV1_1 = await ethers.getContractFactory("CoinSenderV1_1");
    const newContractFactory = await ethers.getContractFactory("CoinSender");
    const oldContract = await upgrades.forceImport(oldContractAddress, 
        newContractFactoryV1_1, 
        {
        kind: "uups",
    });
    const newContract = await upgrades.forceImport(newContractAddress, 
        newContractFactory, 
        {
        kind: "uups",
    });
    // val old = newContractFactoryV1_1.attach(oldContract)
    CoinSender = await upgrades.upgradeProxy(
        oldContract.address,
        newContractFactory
    );
    console.log(newContract);

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
