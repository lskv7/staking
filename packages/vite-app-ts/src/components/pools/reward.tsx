import { CheckCircleOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { transactor } from 'eth-components/functions';
import { EthComponentsSettingsContext } from 'eth-components/models';
import { useGasPrice } from 'eth-hooks';
import { useEthersAppContext } from 'eth-hooks/context';
import React, { FC, useContext } from 'react';

import { useAppContracts } from '~common/components/context';
import { getNetworkInfo } from '~common/functions';
import { Staking } from '~common/generated/contract-types';
import { IPool } from '~~/components/hooks/usePools';

export interface IRewardProps {
  pool: IPool;
}

export const Reward: FC<IRewardProps> = (props) => {
  const { pool } = props;
  const ethersAppContext = useEthersAppContext();
  const ethComponentsSettings = useContext(EthComponentsSettingsContext);
  const [gasPrice] = useGasPrice(ethersAppContext.chainId, 'fast', getNetworkInfo(ethersAppContext.chainId));
  const tx = transactor(ethComponentsSettings, ethersAppContext?.signer, gasPrice);
  const stakingContract: Staking | undefined = useAppContracts('Staking', ethersAppContext.chainId);

  const onClick = async (): Promise<void> => {
    await tx!(stakingContract?.claimReward(pool.token), (update: any) => {
      if (update.status === 1) {
        console.log(update);
        console.log('reward ok  !');
      }
    });
  };
  return (
    <>
      {}
      <Button
        onClick={(): void => {
          void onClick();
        }}
        type="primary"
        key={pool.token + 'Stake'}
        style={{ backgroundColor: '#389e0d', borderColor: 'transparent' }}
        icon={<CheckCircleOutlined />}>
        Get Reward
      </Button>
    </>
  );
};
