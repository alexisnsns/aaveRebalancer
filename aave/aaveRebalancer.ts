import { fetchAllSubgraphAPYs } from "./yields.js";
import { getUserUSDCBalance, getUserAavePositions } from "./positionData.js";
import {
  depositUSDCToAaveSingleChain,
  depositUSDCToAaveCrossChain,
} from "./depositAave.js";
import { withdrawUSDCFromAave } from "./withdrawAave.js";

const rebalanceAavePositions = async () => {
  try {
    // Step 1: Fetch best APY pool
    const allAPYs = await fetchAllSubgraphAPYs();
    const highestAPYpool = allAPYs[0]; // it's already sorted high -> low

    const bestChain = highestAPYpool.chain;
    // for testing purposes
    // const bestChain = 'ARBITRUM';

    console.log("--------------");
    console.log(`Best APY: ${highestAPYpool.apy}% on ${bestChain}`);

    console.log("--------------");
    // Step 2: Fetch user's existing AAVE positions
    const userAaveBalances = await getUserAavePositions();
    console.log("User's deployed USDC on AAVE balances:");

    // Print current AAVE positions
    for (const [chain, balance] of Object.entries(userAaveBalances)) {
      console.log(`- ${chain}: ${balance} USDC`);
    }

    console.log("--------------");
    // Step 3: Check if any Aave positions do not match the highest APY and withdraw
    for (const [chain, balance] of Object.entries(userAaveBalances)) {
      if (
        Number(balance) > 1 &&
        chain.toUpperCase() !== bestChain.toUpperCase()
      ) {
        console.log(
          `Withdrawing the whole position (${balance} USDC) from AAVE on ${chain} as the yield is lower than the one available on ${bestChain}...`
        );
        await withdrawUSDCFromAave(balance.toString(), chain);
      } else if (
        Number(balance) <= 1 &&
        chain.toUpperCase() !== bestChain.toUpperCase()
      ) {
        console.log(
          `Not enough balance (${balance} USDC) on ${chain} to be worth a withdrawal.`
        );
      }
    }

    console.log("--------------");
    // Step 2: Fetch user's USDC balances
    const userBalances = await getUserUSDCBalance();
    console.log("User's undeployed USDC balances:");

    for (const [chain, balance] of Object.entries(userBalances)) {
      console.log(`- ${chain}: ${balance} USDC`);
    }

    console.log("--------------");
    for (const [chain, balance] of Object.entries(userBalances)) {
      if (Number(balance) < 1) {
        console.log(
          `Not enough USDC on ${chain} (${balance}) to be worth a deposit`
        );
      } else if (chain.toUpperCase() === bestChain.toUpperCase()) {
        console.log(
          `Initiating ${balance} USDC single chain deposit ${chain} <> ${chain} to get this juicy ${highestAPYpool.apy}% APY...`
        );
        await depositUSDCToAaveSingleChain(balance.toString(), bestChain);
      } else {
        console.log(
          `Initiating ${balance} USDC cross-chain deposit from ${chain} to ${bestChain} to get this juicy ${highestAPYpool.apy}% APY...`
        );
        await depositUSDCToAaveCrossChain(balance.toString(), chain, bestChain);
      }
    }

    console.log("--------------");
    console.log("🎉 All good broski, yields are maximized.");
  } catch (error) {
    console.error("Error:", error);
  }
};

rebalanceAavePositions();
