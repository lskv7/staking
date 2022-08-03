import { useMoralis, useWeb3Contract } from "react-moralis"
import {
    stakingAddress,
    stakingAbi,
    rewardTokenAbi,
    rewardTokenAddress
} from "../constants"
import { useEffect, useState } from "react"
import { ethers } from "ethers"


export default function StakeDetails() {
    const { account, isWeb3Enabled } = useMoralis()
    const [rtBalance, setRtBalance] = useState('0')
    const [stakedBalance, setStakedBalance] = useState('0')
    const [earnedBalance, setEarnedBalance] = useState('0')


    const { runContractFunction: getRtBalance } = useWeb3Contract({
        abi: rewardTokenAbi,
        contractAddress: rewardTokenAddress,
        functionName: "balanceOf",
        params: {
            account: account,
        }
    })

    const { runContractFunction: getStakedBalance } = useWeb3Contract({
        abi: stakingAbi,
        contractAddress: stakingAddress,
        functionName: "getStaked",
        params: {
            account: account,
        }
    })

    const { runContractFunction: getEarned } = useWeb3Contract({
        abi: stakingAbi,
        contractAddress: stakingAddress,
        functionName: "earned",
        params: {
            account: account,
        }
    })


    useEffect(() => {
        if (isWeb3Enabled && account) { updateUiValues() }
    }, [account, isWeb3Enabled])

    async function updateUiValues() {
        // Return bigNumber
        const rtBalanceFromContract = (await getRtBalance({ onError: (error) => console.log(error) })).toString()
        const formattedRtBalanceFromContract = ethers.utils.formatUnits(rtBalanceFromContract, "ether")
        setRtBalance(formattedRtBalanceFromContract)

        const stakedFromContract = (await getStakedBalance({ onError: (error) => console.log(error) })).toString()
        const formattedStakedFromContract = ethers.utils.formatUnits(stakedFromContract, "ether")
        setStakedBalance(formattedStakedFromContract)

        const earnedFromContract = (await getEarned({ onError: (error) => console.log(error) })).toString()
        const formattedEarnedFromContract = ethers.utils.formatUnits(earnedFromContract, "ether")
        setEarnedBalance(formattedEarnedFromContract)
    }
    return (<><div>Rt Balance is : {rtBalance}</div>
        <div>Earned Balance is : {earnedBalance}</div>
        <div>Staked Balance is : {stakedBalance}</div></>)
}