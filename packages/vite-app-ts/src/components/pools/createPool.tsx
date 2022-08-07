import { Button, Form, Input, Modal } from 'antd';
import { transactor } from 'eth-components/functions';
import { EthComponentsSettingsContext } from 'eth-components/models';
import { useGasPrice } from 'eth-hooks';
import { useEthersAppContext } from 'eth-hooks/context';
import React, { FC, useContext, useState } from 'react';

import { useAppContracts } from '~common/components/context';
import { getNetworkInfo } from '~common/functions';
import { Staking } from '~common/generated/contract-types';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ICreatePoolProps {}

interface IPoolForm {
  tokenAddress: string;
  oracle: string;
  rewardRate: number;
}

export const CreatePool: FC<ICreatePoolProps> = (props) => {
  const ethersAppContext = useEthersAppContext();
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();
  const ethComponentsSettings = useContext(EthComponentsSettingsContext);
  const [gasPrice] = useGasPrice(ethersAppContext.chainId, 'fast', getNetworkInfo(ethersAppContext.chainId));
  const tx = transactor(ethComponentsSettings, ethersAppContext?.signer, gasPrice);
  const stakingContract: Staking | undefined = useAppContracts('Staking', ethersAppContext.chainId);

  const onValidate = async (values: IPoolForm): Promise<void> => {
    await tx!(stakingContract?.createPool(values.tokenAddress, values.oracle, values.rewardRate), (update: any) => {
      setVisible(false);
      if (update.status === 1) {
        console.log('Pool created!');
      }
    });
  };
  return (
    <>
      <Button type="primary" size={'large'} onClick={(): void => setVisible(true)}>
        Create new Pool
      </Button>
      <Modal
        visible={visible}
        title="Create a new Pool"
        okText="Create"
        cancelText="Cancel"
        onCancel={(): void => setVisible(false)}
        onOk={(): void => {
          form
            .validateFields()
            .then(async (values) => {
              form.resetFields();
              await onValidate(values as IPoolForm);
            })
            .catch((info) => {
              console.log('Validate Failed:', info);
            });
        }}>
        <Form form={form} name="pool-form" preserve={false}>
          {/* //onFinish={onFinish}>*/}
          <Form.Item name="oracle" label="Oracle Feed" rules={[{ required: true }]}>
            <Input type={'string'} />
          </Form.Item>
          <Form.Item name="tokenAddress" label="Token Address" rules={[{ required: true }]}>
            <Input type={'string'} />
          </Form.Item>
          <Form.Item name="rewardRate" label="Reward Rate" rules={[{ required: true }]}>
            <Input type={'number'} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
