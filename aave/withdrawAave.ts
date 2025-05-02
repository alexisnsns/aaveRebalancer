import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

import {
  USDC_ADDRESSES,
  USDC_DECIMALS,
  POOL_ADDRESSES,
  CHAIN_IDS,
} from "../utils/resources.js";

import {
  buildFinalTxObject,
  generateWithdrawCallDataAave,
} from "../utils/utils.js";

import { providers, wallets } from "../utils/ethersUtils.js";


export async function withdrawUSDCFromAave(
  amountToDeposit: string,
  chainName: string
) {
  const _TOKEN_ADDRESS = USDC_ADDRESSES[chainName.toUpperCase()];
  const _CHAIN_ID = CHAIN_IDS[chainName.toUpperCase()];

  const _SIGNER = wallets[chainName.toUpperCase()];
  const _PROVIDER = providers[chainName.toUpperCase()];
  const _POOL_ADDRESS = POOL_ADDRESSES[chainName.toUpperCase()];

  try {
    const withdrawAmount = ethers.parseUnits(amountToDeposit, USDC_DECIMALS);

    // Generate initial message for fee estimation
    const callData = await generateWithdrawCallDataAave(
      withdrawAmount,
      _TOKEN_ADDRESS
    );

    // console.log("Generated CallData:", callData);

    const txObject = await buildFinalTxObject(
      callData,
      _CHAIN_ID,
      _POOL_ADDRESS,
      _PROVIDER
    );

    console.log("Sending withdraw transaction...");

    const withdrawTx = await _SIGNER.sendTransaction(txObject);
    await withdrawTx.wait();
    console.log("Transaction receipt received.");
  } catch (error) {
    console.error("Error in withdraw process:", error);
  }
}

// const amount = ethers.formatUnits("6586337", USDC_DECIMALS);
// withdrawUSDCFromAave(amount, "POLYGON");
