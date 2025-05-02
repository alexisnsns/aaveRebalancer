import { ethers } from "ethers";

import {
  USDC_DECIMALS,
  POOL_ADDRESSES,
  USDC_ADDRESSES,
  ERC20_ABI,
  AAVE_USDC_TOKEN_ADDRESSES,
  CHAINS,
} from "../utils/resources.js";

import { wallets, providers } from "../utils/ethersUtils.js";

// On L2s the address is always the same
const userAddress = await wallets["POLYGON"].getAddress();

export async function getUserAavePositions() {
  const accountPromises = CHAINS.map(async (chain) => {
    const contract = new ethers.Contract(
      AAVE_USDC_TOKEN_ADDRESSES[chain],
      ERC20_ABI,
      providers[chain]
    );

    const rawBalance = await contract.balanceOf(userAddress);
    return {
      chain,
      balance: ethers.formatUnits(rawBalance, 6),
    };
  });

  const results = await Promise.all(accountPromises);

  const positionsByChain = Object.fromEntries(
    results
      .filter(({ balance }) => balance !== "0.0")
      .map(({ chain, balance }) => [chain.toUpperCase(), balance])
  );

  // console.log(positionsByChain)
  return positionsByChain;
}

// getUserAavePositions();

export async function getUserUSDCBalance() {
  try {
    const balancePromises = CHAINS.map(async (chain) => {
      const contractAddress = USDC_ADDRESSES[chain];
      if (!contractAddress) {
        throw new Error(`No contract address for ${chain}`);
      }

      const contract = new ethers.Contract(
        contractAddress,
        ERC20_ABI,
        providers[chain]
      );

      const [rawBalance] = await Promise.all([contract.balanceOf(userAddress)]);

      return {
        chain,
        balance: ethers.formatUnits(rawBalance, USDC_DECIMALS),
      };
    });

    const results = await Promise.all(balancePromises);

    const balancesByChain = Object.fromEntries(
      results
        .filter(({ balance }) => balance !== "0.0")
        .map(({ chain, balance }) => [chain.toUpperCase(), balance])
    );

    // console.log('current usdc balances', balancesByChain)
    return balancesByChain;
  } catch (error) {
    console.error("Error getting USDC balance:", error);
    throw error;
  }
}

// getUserUSDCBalance();
