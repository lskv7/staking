import { Col, List, Progress, Row, Statistic } from 'antd';
import { useSignerAddress } from 'eth-hooks';
import { useEthersAppContext } from 'eth-hooks/context';
import { useTokenBalance } from 'eth-hooks/erc';
import { ethers } from 'ethers';
import React, { FC } from 'react';

import { ERC20, ERC20__factory } from '~common/generated/contract-types';
import { IPool } from '~~/components/hooks/usePools';
import { Reward } from '~~/components/pools/reward';
import { Stake } from '~~/components/pools/stake';
import { TokenFaucet } from '~~/components/pools/tokenFaucet';
import { Withdraw } from '~~/components/pools/withdraw';
import { bigIntegerToFixed } from '~~/helpers/utils';

export interface IPoolProps {
  pool: IPool;
}

export const Pool: FC<IPoolProps> = (props) => {
  const { pool } = props;
  const ethersAppContext = useEthersAppContext();
  const contract: ERC20 = new ethers.Contract(pool.token, ERC20__factory.abi, ethersAppContext.provider) as ERC20;
  const [myAddress] = useSignerAddress(ethersAppContext.signer);
  const [balance] = useTokenBalance(contract, myAddress!);
  console.log(contract.address, balance);
  return (
    <>
      <List.Item
        key={pool.token}
        actions={[
          <TokenFaucet pool={pool} key={'token-button'} />,
          <Stake pool={pool} key={'staking-button'} />,
          <Withdraw pool={pool} key={'withdraw-button'} />,
          <Reward pool={pool} key={'reward-button'} />,
        ]}>
        <List.Item.Meta
          avatar={<></>}
          title={pool.name}
          description={`${pool.name} pool with total supply of ${bigIntegerToFixed(pool.totalSupply, 4)}`}
        />
        <Row gutter={20} style={{ display: 'flex', justifyContent: 'center' }}>
          <Col span={4}>
            <Progress
              type="circle"
              percent={
                pool.userInfo.balance.isZero() ? 0 : pool.totalSupply.div(pool.userInfo.balance).toNumber() * 100
              }
            />
          </Col>
          <Col span={4}>
            <Statistic
              title="Amount staked"
              value={`${bigIntegerToFixed(pool.userInfo.balance, 4)} ${pool.symbol}`}
              precision={2}
            />
          </Col>
          <Col span={4}>
            <Statistic title="Total Supply" value={bigIntegerToFixed(pool.totalSupply, 4)} />
          </Col>
          <Col span={4}>
            <Statistic title={`Your ${pool.symbol} balance`} value={bigIntegerToFixed(balance, 4)} />
          </Col>
        </Row>
      </List.Item>
    </>
  );
};
