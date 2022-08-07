import { PlusCircleOutlined } from '@ant-design/icons';
import { parseEther } from '@ethersproject/units';
import { Button, Form, Input, Modal } from 'antd';
import { transactor } from 'eth-components/functions';
import { EthComponentsSettingsContext } from 'eth-components/models';
import { useGasPrice } from 'eth-hooks';
import { useEthersAppContext } from 'eth-hooks/context';
import { ethers } from 'ethers';
import React, { FC, useContext, useState } from 'react';

import { useAppContracts } from '~common/components/context';
import { getNetworkInfo } from '~common/functions';
import { ERC20, ERC20__factory, Staking } from '~common/generated/contract-types';
import { IPool } from '~~/components/hooks/usePools';

export interface IStakeProps {
  pool: IPool;
}

interface IStakeForm {
  amount: number;
}

export const Stake: FC<IStakeProps> = (props) => {
  const { pool } = props;
  const ethersAppContext = useEthersAppContext();
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();
  const ethComponentsSettings = useContext(EthComponentsSettingsContext);
  const [gasPrice] = useGasPrice(ethersAppContext.chainId, 'fast', getNetworkInfo(ethersAppContext.chainId));
  const tx = transactor(ethComponentsSettings, ethersAppContext?.signer, gasPrice);
  const stakingContract: Staking | undefined = useAppContracts('Staking', ethersAppContext.chainId);
  const contract: ERC20 = new ethers.Contract(pool.token, ERC20__factory.abi, ethersAppContext.signer) as ERC20;

  const onApprove = async (): Promise<void> => {
    const _value = parseEther(form.getFieldValue('amount') as string);
    await tx!(contract.approve(stakingContract?.address as string, _value));
  };
  const onValidate = async (values: IStakeForm): Promise<void> => {
    const _value = parseEther(form.getFieldValue('amount') as string);
    await tx!(stakingContract?.stake(_value, pool.token), (update: any) => {
      setVisible(false);
      if (update.status === 1) {
        console.log('staked !');
      }
    });
  };
  return (
    <>
      <Button
        onClick={(): void => setVisible(true)}
        type="primary"
        key={pool.token + 'Stake'}
        icon={<PlusCircleOutlined />}>
        Stake
      </Button>
      <Modal
        visible={visible}
        title="Stake tokens"
        okText="Stake"
        footer={[
          <Button
            key="1"
            onClick={(): void => {
              void onApprove();
            }}>
            Approve
          </Button>,
          <Button
            key="2"
            onClick={(): void => {
              form
                .validateFields()
                .then(async (values) => {
                  // form.resetFields();
                  await onValidate(values as IStakeForm);
                })
                .catch((info) => {
                  console.log('Validate Failed:', info);
                });
            }}>
            Stake
          </Button>,
        ]}
        cancelText="Cancel"
        onCancel={(): void => setVisible(false)}
        onOk={(): void => {
          form
            .validateFields()
            .then(async (values) => {
              form.resetFields();
              await onValidate(values as IStakeForm);
            })
            .catch((info) => {
              console.log('Validate Failed:', info);
            });
        }}>
        <Form form={form} name="pool-form" preserve={false}>
          <Form.Item name="amount" label="Amount" rules={[{ required: true }]}>
            <Input type={'number'} addonAfter={pool.symbol} />
          </Form.Item>
        </Form>
        <img src={'assets/Expliimg.png'} style={{ width: '100%' }} />
      </Modal>
    </>
  );
};
