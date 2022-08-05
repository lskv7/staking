import { useWeb3Contract } from "react-moralis"
import { rewardTokenAbi, rewardTokenAddress, stakingAddress, stakingAbi } from "../constants"
import { Form } from "@web3uikit/core"
import { ethers } from "ethers"

export default function StakeForm() {
    const { runContractFunction } = useWeb3Contract()
    let approveOptions = {
        abi: rewardTokenAbi,
        contractAddress: rewardTokenAddress,
        functionName: "approve",
    }

    let stakeOptions = {
        abi: stakingAbi,
        contractAddress: stakingAddress,
        functionName: "stake",
    }

    async function handleStakeSubmit(data) {
        const amountToApprove = data.data[0].inputResult
        approveOptions.params = {
            amount: ethers.utils.parseUnits(amountToApprove, "ether").toString(),
            spender: stakingAddress,
        }
        console.log("Approving...")
        const tx = await runContractFunction({
            params: approveOptions,
            onError: (error) => console.log(error),
            onSuccess: () => {
                handleApproveSuccess(approveOptions.params.amount)
            }
        })
    }

    async function handleApproveSuccess(amountToStakeFormatted) {
        stakeOptions.params = {
            amount: amountToStakeFormatted
        }
        console.log(`Staking ${stakeOptions.params.amount} RT Token...`)
        const tx = await runContractFunction({
            params: stakeOptions,
            onError: (error) => console.log(error),
        })
        await tx.wait(1)
        console.log("Transaction has been confirmed by 1 block")
    }

    return (
        <div>
            <Form class="flex text-slate-50 justify-center "
                onSubmit={handleStakeSubmit}
                data={[
                    {
                        inputWidth: "50%",
                        name: "Amount to stake",
                        type: "number",
                        value: "",
                        key: "amountToStake",
                    },
                ]}
                title ="Let's stake !"
            ></Form>
        </div>
    )
}