import {List} from 'antd';
import React, {FC} from 'react';
import {IPool, usePools} from "~~/components/hooks/usePools";
import {Pool} from "~~/components/pools/Pool";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IPoolsProps {
}


export const Pools: FC<IPoolsProps> = (props) => {
  const pools: IPool[] = usePools();
  console.log(pools)
  return (
    <div style={{width:"100%"}} >
      <List
        itemLayout="vertical"
        pagination={{
          onChange: (page):void => {
            console.log(page);
          },
          pageSize: 3,
        }}
        dataSource={pools}
        renderItem={(item: IPool): any => (
          <Pool pool={item}/>
        )}
      />
    </div>
  );
};
