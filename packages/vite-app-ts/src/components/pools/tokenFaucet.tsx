import {Button} from 'antd';
import {useEthersAppContext} from 'eth-hooks/context';
import React, {FC, useContext} from 'react';
import {getNetworkInfo} from '~common/functions';
import {transactor} from "eth-components/functions";
import {EthComponentsSettingsContext} from "eth-components/models";
import {useGasPrice, useSignerAddress} from "eth-hooks";
import {CheckCircleOutlined} from "@ant-design/icons";
import {IPool} from "~~/components/hooks/usePools";
import {parseEther} from "ethers/lib/utils";
import {ERC20__factory, MockERC20__factory} from "~common/generated/contract-types";
import {ethers} from "ethers";
import {MockERC20} from "~common/generated";

export interface ITokenFaucet {
  pool: IPool;
}

export const TokenFaucet: FC<ITokenFaucet> = (props) => {
  const {pool} = props;
  const ethersAppContext = useEthersAppContext();
  const ethComponentsSettings = useContext(EthComponentsSettingsContext);
  const [gasPrice] = useGasPrice(ethersAppContext.chainId, 'fast', getNetworkInfo(ethersAppContext.chainId));
  const tx = transactor(ethComponentsSettings, ethersAppContext?.signer, gasPrice);
  const [myAddress] = useSignerAddress(ethersAppContext.signer);
  const contract:MockERC20 = new ethers.Contract(pool.token, MockERC20__factory.abi, ethersAppContext.signer) as MockERC20;

  const onClick = async (): Promise<void> => {
    await tx!(contract?.mint(myAddress!, parseEther("20")), (update: any) => {
      if (update.status === 1) {
        console.log("faucet ok  !")
      }
    });
  }
  return (
    <>
      {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
      <Button onClick={async (): Promise<void> => await onClick()} type="primary" key={pool.token + "Stake"}
              style={{backgroundColor:"grey", borderColor:"transparent"}} icon={<CheckCircleOutlined />}>
        Get some tokens
      </Button>
    </>
  );
};
