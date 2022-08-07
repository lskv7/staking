
module.exports = async ({getNamedAccounts, deployments}) => {
  const {deploy, log} = deployments
  const {deployer} = await getNamedAccounts()
  const rewardToken = await deployments.get("RewardToken")
  const waitBlockConfirmations = 1
  log("----------------------------------------------------")
  const args = [rewardToken.address]
  await deploy("Staking", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: waitBlockConfirmations,
  })


  log("----------------------------------------------------")
}

module.exports.tags = ["all", "staking"]
