const hre = require("hardhat");
const {ethers, upgrades} = require("hardhat");
const { setImplementationName } = require('@openzeppelin/upgrades-core');

async function main() {

    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    const params = {
        owner: '0x8a8514e4b0D96Ef66Df57421d9cc64eecA349287',
    };

    console.log("New owner:", params.owner);

    // Compile contract
    const contractName = "CoinSender";
    const CoinSender = await ethers.getContractFactory(contractName);

    // Deploy contract
    const proxy = await upgrades.deployProxy(CoinSender,
      Object.values(params),
      {
        initializer: 'initialize',
        kind: "uups",
    });

    // Wait for deployment confirmation
    await proxy.deployed();

    console.log(`# ${contractName} deployed to: ${proxy.address}`);

    // Verify contract
    const network = await ethers.provider.getNetwork();
    console.log(`Verifying ${contractName} on ${network.name} network...`);

    // Wait for 3 minutes to allow for contract to propagate
    console.log("Waiting 3 minutes...");
    await new Promise((resolve) => setTimeout(resolve, 180000));

    // Verify contract
    await hre.run("verify:verify", {
        address: proxy.address,
        constructorArguments: [],
    });

    console.log(`${contractName} verified on ${network.name} network.`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
