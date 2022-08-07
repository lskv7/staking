import {useEventListener, useSignerAddress,} from 'eth-hooks';
import {useEthersAppContext} from 'eth-hooks/context';
import {useEffect, useState} from 'react';

import {useAppContracts} from '~common/components/context';
import {ERC20, ERC20__factory, Staking} from "~common/generated/contract-types";
import {BigNumber} from "@ethersproject/bignumber";
import {ethers} from "ethers";

export interface IPool {
  rewardRate: BigNumber
  rewardPerTokenStored: BigNumber
  oracle: string
  lastUpdateTime: BigNumber
  token: string
  totalSupply: BigNumber
  symbol: string
  name: string
  userInfo: IUserInfo
  tokenBalance: BigNumber
}

export interface IUserInfo {
  userRewardPerTokenPaid: BigNumber
  balance: BigNumber
  rewards: BigNumber
}


/**
 * Get pools from contract's events
 *
 */
export const usePools = (): IPool[] => {
  const ethersAppContext = useEthersAppContext();
  const stakingContract: Staking | undefined = useAppContracts('Staking', ethersAppContext.chainId);
  const [pools, setPools] = useState<IPool[]>([]);
  //const [poolsEvents] = useEventListener(stakingContract, "PoolCreated", 0);
  const [myAddress] = useSignerAddress(ethersAppContext.signer);

  const updateAllPools = async (): Promise<void> => {
    if (stakingContract && ethersAppContext.signer && myAddress) {
      const eventFilter = stakingContract.filters.PoolCreated();
      const _poolsEvents = await stakingContract.queryFilter(eventFilter)
      const _pools = await Promise.all(_poolsEvents.map(async (e): Promise<IPool> => {
        const _pool = (await stakingContract.getPool(e.args.tokenAddress));
        const userInfo: IUserInfo = (await stakingContract.getUserInfoPerPool(e.args.tokenAddress));
        const contract: ERC20 = new ethers.Contract(e.args.tokenAddress, ERC20__factory.abi, ethersAppContext.signer) as ERC20;
        const _tokenBalance: BigNumber = (await contract.balanceOf(myAddress));
        return {
          lastUpdateTime: _pool.lastUpdateTime,
          name: e.args.name,
          oracle: _pool.oracle,
          rewardPerTokenStored: _pool.rewardPerTokenStored,
          rewardRate: _pool.rewardRate,
          symbol: e.args.symbol,
          token: _pool.token,
          totalSupply: _pool.totalSupply,
          userInfo: userInfo,
          tokenBalance: _tokenBalance
        };
      }));
      setPools(_pools);
    }
  }
  /**
   * Reload all infos for each updateReward function.
   * TODO: do better with just updating the necessary infos
   */
  useEffect(() => {
    void updateAllPools();
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    stakingContract?.on("PoolCreated", async (): Promise<void> => {
      await updateAllPools();
    });
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    stakingContract?.on("Staked", async (): Promise<void> => {
      await updateAllPools();
    });
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    stakingContract?.on("RewardsClaimed", async (): Promise<void> => {
      await updateAllPools();
    });
  }, [stakingContract, ethersAppContext.signer, myAddress]);

  return pools;
};
