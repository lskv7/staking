import { MinusCircleOutlined } from '@ant-design/icons';
import { Button, Form, Input, Modal } from 'antd';
import { transactor } from 'eth-components/functions';
import { EthComponentsSettingsContext } from 'eth-components/models';
import { useGasPrice } from 'eth-hooks';
import { useEthersAppContext } from 'eth-hooks/context';
import React, { FC, useContext, useState } from 'react';

import { useAppContracts } from '~common/components/context';
import { getNetworkInfo } from '~common/functions';
import { Staking } from '~common/generated/contract-types';
import { IPool } from '~~/components/hooks/usePools';

export interface IWithdrawProps {
  pool: IPool;
}

interface IWithdrawForm {
  amount: number;
}

export const Withdraw: FC<IWithdrawProps> = (props) => {
  const { pool } = props;
  const ethersAppContext = useEthersAppContext();
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();
  const ethComponentsSettings = useContext(EthComponentsSettingsContext);
  const [gasPrice] = useGasPrice(ethersAppContext.chainId, 'fast', getNetworkInfo(ethersAppContext.chainId));
  const tx = transactor(ethComponentsSettings, ethersAppContext?.signer, gasPrice);
  const stakingContract: Staking | undefined = useAppContracts('Staking', ethersAppContext.chainId);

  const onValidate = async (values: IWithdrawForm): Promise<void> => {
    await tx!(stakingContract?.withdraw(values.amount, pool.token), (update: any) => {
      setVisible(false);
      if (update.status === 1) {
        console.log('Withdraw done!');
      }
    });
  };
  return (
    <>
      <Button
        onClick={(): void => setVisible(true)}
        danger
        type="primary"
        key={pool.token + 'Stake'}
        icon={<MinusCircleOutlined />}>
        Withdraw
      </Button>
      <Modal
        visible={visible}
        title="Withdraw tokens"
        okText="Confirm"
        cancelText="Cancel"
        onCancel={(): void => setVisible(false)}
        onOk={(): void => {
          form
            .validateFields()
            .then(async (values) => {
              form.resetFields();
              await onValidate(values as IWithdrawForm);
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
      </Modal>
    </>
  );
};
