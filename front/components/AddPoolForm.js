import { useWeb3Contract } from "react-moralis"
import { stakingAddress, stakingAbi } from "../constants"
import { Form } from "@web3uikit/core"

export default function AddPoolForm() {
    const { runContractFunction } = useWeb3Contract()

    let createPoolOptions = {
        abi: stakingAbi,
        contractAddress: stakingAddress,
        functionName: "createPool",
    }

    async function handleCreatePoolSubmit(data) {
        const formData = data.data
        // const [tokenAddress, oracle, rewardRate] = formData
        const tokenAddress = formData[0].inputResult
        const oracle = formData[1].inputResult
        const rewardRate = formData[2].inputResult

        createPoolOptions.params = {
            _tokenAddress: tokenAddress,
            _oracle: oracle,
            _rewardRate: rewardRate
        }
        console.log(`Create pool for token: ${tokenAddress} with Oracle: ${oracle} and Reward Rate: ${rewardRate}...`)
        const tx = await runContractFunction({
            params: createPoolOptions,
            onError: (error) => console.log(error),
        })
        await tx.wait(1)
        console.log("Transaction has been confirmed by 1 block")
    }

    return (
        <div>
            <Form
                onSubmit={handleCreatePoolSubmit}
                data={[
                    {
                        inputWidth: "50%",
                        name: "Token Used To Create Pool",
                        type: "text",
                        value: "",
                        key: "tokenToCreatePool",
                    },
                    {
                        inputWidth: "50%",
                        name: "Oracle for this token",
                        type: "text",
                        value: "",
                        key: "oracleToCreatePool",
                    },
                    {
                        inputWidth: "50%",
                        name: "Reward Rate for this token",
                        type: "number",
                        value: "",
                        key: "rewardRateToCreatePool",
                    },
                ]}
                title="Let's create a new Pool !"
            ></Form>
        </div>
    )
}