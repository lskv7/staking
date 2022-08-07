import {assert, expect} from "chai";

import {deployments, ethers, network} from "hardhat";

import {moveBlocks} from "../utils/move-blocks";

import {moveTime} from "../utils/move-time";
import {BigNumber} from "ethers";


const SECONDS_IN_A_DAY = 86400
const SECONDS_IN_A_YEAR = 31449600

describe("Staking Unit Tests", function () {
  // eslint-disable-next-line unused-imports/no-unused-vars-ts
  let staking:any, rewardToken:any, deployer:any, dai:any, stakeAmount:BigNumber, daiETHPriceFeed:any;
  beforeEach(async () => {
    const accounts = await ethers.getSigners()
    deployer = accounts[0]
    await deployments.fixture(["mock", "rewardtoken", "staking"])

    staking = await ethers.getContract("Staking")
    dai = await ethers.getContract("DAI");
    daiETHPriceFeed = await ethers.getContract("DAIETHPriceFeed")
    rewardToken = await ethers.getContract("RewardToken")
    stakeAmount = ethers.utils.parseEther("100000")
  })

  describe("stake", () => {
    it("create pool", async () => {
      console.log(dai.address)
      void expect(await staking.createPool(dai.address, daiETHPriceFeed.address, 100)).to.emit(staking, "PoolCreated").withArgs(dai.address, daiETHPriceFeed.address, 100);
    })
    it("Returns the reward amount of 1 token based time spent locked up", async () => {
      await staking.createPool(dai.address, daiETHPriceFeed.address, 100);
      await dai.approve(staking.address, stakeAmount)
      await staking.stake(stakeAmount, dai.address)
      await moveTime(SECONDS_IN_A_DAY)
      await moveBlocks(1)
      let reward = await staking.rewardPerToken(dai.address)
      let expectedReward = "86"
      assert.equal(reward.toString(), expectedReward)
      await moveTime(SECONDS_IN_A_YEAR)
      await moveBlocks(1)
      reward = await staking.rewardPerToken(dai.address)
      expectedReward = "31536"
      assert.equal(reward.toString(), expectedReward)
    })

    it("Moves tokens from the user to the staking contract", async () => {
      await staking.createPool(dai.address, daiETHPriceFeed.address, 100);
      await dai.approve(staking.address, stakeAmount)
      await staking.stake(stakeAmount, dai.address)
      await moveTime(SECONDS_IN_A_DAY)
      await moveBlocks(1)
      const earned = await staking.earned(deployer.address, dai.address)
      const expectedEarned = "8600000"
      assert.equal(expectedEarned, earned.toString())
    })
  })

  describe("withdraw", () => {
    it("Moves tokens from the user to the staking contract", async () => {
      await staking.createPool(dai.address, daiETHPriceFeed.address, 100);
      await dai.approve(staking.address, stakeAmount)
      await staking.stake(stakeAmount, dai.address)
      await moveTime(SECONDS_IN_A_DAY)
      await moveBlocks(1)
      const balanceBefore = await dai.balanceOf(deployer.address)
      await staking.withdraw(stakeAmount, dai.address)
      const balanceAfter = await dai.balanceOf(deployer.address)
      const earned = await staking.earned(deployer.address, dai.address)
      const expectedEarned = "8600000"
      assert.equal(expectedEarned, earned.toString())
      assert.equal(balanceBefore.add(stakeAmount).toString(), balanceAfter.toString())
    })
  })
  describe("claimReward", () => {
    it("user get what they earned", async () => {
      await staking.createPool(dai.address, daiETHPriceFeed.address, 100);
      await dai.approve(staking.address, stakeAmount)
      await staking.stake(stakeAmount, dai.address)
      await moveTime(SECONDS_IN_A_DAY)
      await moveBlocks(1)
      const _claim = await staking.claimReward(dai.address);
      const result = await _claim.wait();
      console.log("1")
      console.log(result)
      console.log("2")
      /*
                      const balanceBefore = await rewardToken.balanceOf(deployer.address)
                      await staking.claimReward()
                      const balanceAfter = await rewardToken.balanceOf(deployer.address)
                      assert.equal(balanceBefore.add(earned).toString(), balanceAfter.toString())*/
    })
  })
})
