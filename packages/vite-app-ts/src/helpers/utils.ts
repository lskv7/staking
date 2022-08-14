import { BigNumber } from '@ethersproject/bignumber';
import { formatEther } from '@ethersproject/units';

export const bnToFixed = (bn: BigNumber, decimals: number): string => {
  let res = formatEther(bn);
  res = (+res).toFixed(4);
  return res;
};
