import {Col, List, Progress, Row, Statistic} from 'antd';
import React, {FC} from 'react';
import {IPool} from "~~/components/hooks/usePools";
import {Stake} from "~~/components/pools/stake";
import {Withdraw} from "~~/components/pools/withdraw";
import {Reward} from "~~/components/pools/reward";
import {TokenFaucet} from "~~/components/pools/tokenFaucet";
import {formatEther} from "@ethersproject/units";

export interface IPoolProps {
  pool: IPool
}

export const Pool: FC<IPoolProps> = (props) => {
  const {pool} = props;
  return (
    <>
    <List.Item
      key={pool.token}
      actions={[
        <TokenFaucet pool={pool} key={"token-button"}/>,
        <Stake pool={pool} key={"staking-button"}/>,
        <Withdraw pool={pool} key={"withdraw-button"}/>,
        <Reward pool={pool} key={"reward-button"}/>,
      ]}
    >
      <List.Item.Meta
        avatar={<></>}
        title={pool.name}
        description={`${pool.name} pool with total supply of ${pool.totalSupply}`}
      />
      <Row gutter={20} style={{display:"flex", justifyContent:"center"}}>
        <Col span={4}>
          <Progress
            type="circle"
            percent={pool.userInfo.balance.isZero()?0:pool.totalSupply.div(pool.userInfo.balance).toNumber()*100}
          />
        </Col>
        <Col span={4}>
          <Statistic title="Amount staked" value={`${formatEther(pool.userInfo.balance)} ${pool.symbol}`} precision={2} />
        </Col>
        <Col span={4}>
          <Statistic title="Total Supply" value={formatEther(pool.totalSupply)} />
        </Col>

      </Row>
      <Row  style={{display:"flex", justifyContent:"center"}} >
        <Col span={4}>
          <Statistic title={`Your ${pool.symbol} balance`} value={formatEther(pool.tokenBalance)} />
        </Col>
        <Col span={4}>
          <Statistic title="Last Updated Time" value={pool?new Date(pool.lastUpdateTime.toNumber() * 1000).toLocaleTimeString("en-US"):"?"} />
        </Col>
        <Col span={4}>
          <Statistic title="Reward per token stored" value={formatEther(pool.rewardPerTokenStored)} />
        </Col>

      </Row>
    </List.Item>
    </>
  );

};
