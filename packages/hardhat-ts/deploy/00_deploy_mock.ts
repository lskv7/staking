import { DeployFunction } from 'hardhat-deploy/types';
import { THardhatRuntimeEnvironmentExtended } from 'helpers/types/THardhatRuntimeEnvironmentExtended';
import {ethers, getChainId} from "hardhat";


const localChainId = "31337";

const DAI_INITIAL_PRICE = ethers.utils.parseEther("0.001"); // 1 DAI = $1 & ETH = $1,000
const BTC_INITIAL_PRICE = ethers.utils.parseEther("2"); // 1 WBTC = $2,000 & ETH = $1,000
const DECIMALS = 18;

const func: DeployFunction = async (hre: THardhatRuntimeEnvironmentExtended) => {
  const { getNamedAccounts, deployments } = hre;
  const { deployer } = await getNamedAccounts();
  const { deploy , log} = deployments;
  const chainId = await getChainId();
  console.log(chainId)

  if (chainId == localChainId) {
    log("Local network detected! Deploying mocks...")
    await deploy("DAIETHPriceFeed", {
      contract: "MockV3Aggregator",
      from: deployer,
      log: true,
      args: [DECIMALS, DAI_INITIAL_PRICE],
    })
    await deploy("WBTCETHPriceFeed", {
      contract: "MockV3Aggregator",
      from: deployer,
      log: true,
      args: [DECIMALS, BTC_INITIAL_PRICE],
    })
    await deploy("DAI", {
      contract: "MockERC20",
      from: deployer,
      log: true,
      args: ["DAI", "DAI"],
    })
    await deploy("WBTC", {
      contract: "MockERC20",
      from: deployer,
      log: true,
      args: ["Wrapped Bitcoin", "WBTC"],
    })
    await deploy("RandomToken", {
      contract: "MockERC20",
      from: deployer,
      log: true,
      args: ["Random Token", "RT"],
    })
    log("Mocks Deployed!");
    log("----------------------------------------------------")
    log("You are deploying to a local network, you'll need a local network running to interact")
    log("Please run `yarn hardhat console` to interact with the deployed smart contracts!")
    log("----------------------------------------------------")
  }

  /*
    // Getting a previously deployed contract
    const YourContract = await ethers.getContract("YourContract", deployer);
    await YourContract.setPurpose("Hello");
    
    //const yourContract = await ethers.getContractAt('YourContract', "0xaAC799eC2d00C013f1F11c37E654e59B0429DF6A") //<-- if you want to instantiate a version of a contract at a specific address!
  */
};
export default func;
func.tags = ['YourContract'];

/*
Tenderly verification
let verification = await tenderly.verify({
  name: contractName,
  address: contractAddress,
  network: targetNetwork,
});
*/
