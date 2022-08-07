# BlockFi
[Staking Dapp](https://stakingalyra.web.app/)
Deployed on rinkeby 

# Team
* Mathieu G.
* Hugo D.
* Guillaume Q.

## Demo
![Demo video](BlockFi.mov)

## Directories


```bash
packages/vite-app-ts/
packages/hardhat-ts/
```

## Quick Start

### Commands to run the app

Running the app

1. install your dependencies, `open a new command prompt`

   ```bash
   yarn install
   ```

2. start a hardhat node

   ```bash
   yarn chain
   ```

3. run the app, `open a new command prompt`

   ```bash
   # build hardhat & external contracts types
   yarn contracts:build
   # deploy your hardhat contracts
   yarn deploy
   # start the app (vite)
   yarn start
   ```
   
5. other commands

   ```bash
   # rebuild all contracts, incase of inconsistent state
   yarn contracts:rebuild
   # run hardhat commands for the workspace, or see all tasks
   yarn hardhat 'xxx'
   # get eth for testing locally
   yarn hardhat faucet xxx
   # run any subgraph commands for the workspace
   yarn subgraph 'xxx'
   ```

   Other folders

   ```bash
   # for subgraph
   packages/advanced/subgraph/
   packages/advanced/services/
   ```

### Environment Variables

Vite  app folders has `.env` files. To create local variables that overrride these, create a file called `.env.local`, or `.env.development.local` or `.env.production.local` and put your overrides in there.

You can set your `TARGET_NETWORK` with them.


