import { ethers } from "ethers";

import dotenv from "dotenv";
dotenv.config();

import {
  USDC_DECIMALS,
  POOL_ADDRESSES,
  CHAIN_IDS,
  USDC_ADDRESSES,
  SPOKEPOOL_ADDRESSES,
} from "../utils/resources.js";

import {
  buildAccrossCallData,
  approveUSDCSpending,
  buildFinalTxObject,
  generateSingleChainDepositCallDataAave,
} from "../utils/utils.js";

import { providers, wallets } from "../utils/ethersUtils.js";

export async function depositUSDCToAaveCrossChain(
  amountToDeposit: string,
  inputChain: string,
  outputChain: string
) {
  // INPUT CHAIN
  const INPUT_CHAIN_ID = CHAIN_IDS[inputChain.toUpperCase()];
  const INPUT_TOKEN_ADDRESS = USDC_ADDRESSES[inputChain.toUpperCase()];
  const SIGNER = wallets[inputChain.toUpperCase()];
  const PROVIDER = providers[inputChain.toUpperCase()];
  const SPENDER_ADDRESS = SPOKEPOOL_ADDRESSES[inputChain.toUpperCase()];

  // OUTPUT CHAIN
  const OUTPUT_TOKEN_ADDRESS = USDC_ADDRESSES[outputChain.toUpperCase()];
  const OUTPUT_CHAIN_ID = CHAIN_IDS[outputChain.toUpperCase()];
  const OUTPUT_POOL_ADDRESS = POOL_ADDRESSES[outputChain.toUpperCase()];

  try {
    const depositAmount = ethers.parseUnits(amountToDeposit, USDC_DECIMALS);

    // Approve Across spender address
    await approveUSDCSpending(
      depositAmount,
      INPUT_TOKEN_ADDRESS,
      SPENDER_ADDRESS,
      SIGNER,
      PROVIDER
    );

    const finalCallData = await buildAccrossCallData(
      depositAmount,
      INPUT_TOKEN_ADDRESS,
      INPUT_CHAIN_ID,
      OUTPUT_TOKEN_ADDRESS,
      OUTPUT_CHAIN_ID,
      OUTPUT_POOL_ADDRESS
    );

    // Create transaction with the final data
    const txObject = await buildFinalTxObject(
      finalCallData,
      INPUT_CHAIN_ID,
      SPENDER_ADDRESS,
      PROVIDER
    );

    // console.log("Sending transaction...");
    const depositTx = await SIGNER.sendTransaction(txObject);
    await depositTx.wait();
    console.log("Cross Chain Deposit transaction receipt received.");
  } catch (error) {
    console.error("Error in cross chain deposit process:", error);
  }
}

export async function depositUSDCToAaveSingleChain(
  amountToDeposit: string,
  chainName: string
) {
  const _INPUT_TOKEN_ADDRESS = USDC_ADDRESSES[chainName.toUpperCase()];
  const _CHAIN_ID = CHAIN_IDS[chainName.toUpperCase()];

  const _SIGNER = wallets[chainName.toUpperCase()];
  const _PROVIDER = providers[chainName.toUpperCase()];
  const _POOL_ADDRESS = POOL_ADDRESSES[chainName.toUpperCase()];

  try {
    const depositAmount = ethers.parseUnits(amountToDeposit, USDC_DECIMALS);

    // Approve Across spender address
    await approveUSDCSpending(
      depositAmount,
      _INPUT_TOKEN_ADDRESS,
      // AAVE POOL ADDRESS
      _POOL_ADDRESS,
      _SIGNER,
      _PROVIDER
    );

    const finalCallData = await generateSingleChainDepositCallDataAave(
      depositAmount,
      _INPUT_TOKEN_ADDRESS
    );

    // Create transaction with the final data
    const txObject = await buildFinalTxObject(
      finalCallData,
      _CHAIN_ID,
      // AAVE POOL ADDRESS
      _POOL_ADDRESS,
      _PROVIDER
    );

    // console.log("Sending transaction...");
    const depositTx = await _SIGNER.sendTransaction(txObject);
    const receipt = await depositTx.wait();
    console.log("Single Chain Deposit transaction receipt received.");
  } catch (error) {
    console.error("Error in single chain deposit process:", error);
  }
}

// depositUSDCToAaveCrossChain();
// depositUSDCToAaveSingleChain("0.3", "OPTIMISM");
