const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    const params = {
        percent: 100, // Set the percentage here
        bank: '0x8a8514e4b0D96Ef66Df57421d9cc64eecA349287', // Set the bank address here
        defaultAdmin: deployer.address, // Set the default admin address here
    };

    console.log("New owner:", params.defaultAdmin);

    // Compile contract
    const contractName = "CoinSender";
    const CoinSender = await ethers.getContractFactory(contractName);

    // Deploy contract
    const coinSender = await CoinSender.deploy(params.percent, params.bank, params.defaultAdmin);
    console.log(`Deploying ${contractName}...`);

    // Wait for deployment confirmation
    await coinSender.deployed();

    console.log(`${contractName} deployed to: ${coinSender.address}`);

    // Verify contract
    const network = await ethers.provider.getNetwork();
    console.log(`Verifying ${contractName} on ${network.name} network...`);

    // Wait for 3 minutes to allow for contract to propagate
    console.log("Waiting 3 minutes...");
    await new Promise((resolve) => setTimeout(resolve, 180000));

    // Verify contract
    await hre.run("verify:verify", {
        address: coinSender.address,
        constructorArguments: [params.percent, params.bank, params.defaultAdmin],
    });

    console.log(`${contractName} verified on ${network.name} network.`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
