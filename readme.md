AAVE REBALANCER

This script manages your aave positions, on autopilot.
The script fetches the available USDC on different networks, and fetches the highest yield on AAVE pools.
The script 1/deploys unused USDC to the highest yielding pool when available and 2/ bridges the user positions between chains to benefit from the highest APY available at all times.

It also checks if there is enough gas fees to cover the operation cost, and if the bridge slippage is within acceptable bounds.

Available networks are: Base, Arbitrum, Polygon, Optimism, and Scroll.

This is an AAVE-focused iteration of a general purpose defi Rebalancer.
To make it work:

- Just put the seedphrase of your wallet in a .env at the root of the project, and your subgraph API key to fetch the aave yields
- run 'npm install'
- run 'npm run aaveRebalancer'

Expected result is something like this:

---

Best APY: 3.35% on ARBITRUM

User's deployed USDC on AAVE balances:

- SCROLL: 4.985011 USDC

---

Withdrawing the whole position (4.985011 USDC) from AAVE on SCROLL as the yield is lower than the one available on ARBITRUM...
Sending withdraw transaction...
Transaction receipt received.

---

User's undeployed USDC balances:

- SCROLL: 4.985011 USDC

---

Initiating 4.985011 USDC cross-chain deposit from SCROLL to ARBITRUM to get this juicy 3.35% APY...
Approval transaction submitted.
Approval transaction receipt received.
Bridge slippage is within acceptable limits: 0.003236 %; proceeding with L2 bridge tx.
Cross Chain Deposit transaction receipt received.

---

🎉 All good broski, yields are maximized.
