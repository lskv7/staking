import React, {FC} from 'react';
import {CreatePool} from "~~/components/pools/createPool";
import {Pools} from '~~/components/pools/Pools';
import {Divider, Layout} from "antd";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface PoolsProps {
}

export const PoolsUI: FC<PoolsProps> = (props) => {

  return (
    <Layout style={{padding:"90px"}}>
      <Layout.Header>
        <CreatePool/>
      </Layout.Header>
      <Divider/>
      <Layout.Content>
        <Pools/>
      </Layout.Content>
    </Layout>
  );
};
