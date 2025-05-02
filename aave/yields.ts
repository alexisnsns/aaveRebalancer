import { SUBGRAPH_IDS } from "../utils/resources.js";
import axios from "axios";

import dotenv from "dotenv";
dotenv.config();

const { API_KEY_SUBGRAPH } = process.env;

const RAY = 1e27;
const SECONDS_PER_YEAR = 31_536_000;

const fetchSingleSubgraphAPY = async (
  network: keyof typeof SUBGRAPH_IDS & string
): Promise<number | null> => {
  const subgraphId = SUBGRAPH_IDS[network];
  if (!subgraphId) return null;

  const SUBGRAPH_URL = `https://gateway.thegraph.com/api/subgraphs/id/${subgraphId}`;

  try {
    const query = `
      {
        reserveParamsHistoryItems(
          where: { reserve_: { symbol: "USDC" } }
          orderBy: timestamp
          orderDirection: desc
          first: 1
        ) {
          liquidityRate
        }
      }
    `;

    const response = await axios.post(
      SUBGRAPH_URL,
      { query },
      {
        headers: {
          Authorization: `Bearer ${API_KEY_SUBGRAPH}`,
        },
      }
    );

    const rayValue =
      response.data.data.reserveParamsHistoryItems[0]?.liquidityRate;
    if (!rayValue) return null;

    const depositAPR = Number(rayValue) / RAY;
    const depositAPY =
      Math.pow(1 + depositAPR / SECONDS_PER_YEAR, SECONDS_PER_YEAR) - 1;
    return +(depositAPY * 100).toFixed(2);
  } catch (err) {
    console.error(`❌ Error fetching APY for ${network}:`, err.message);
    return null;
  }
};

fetchSingleSubgraphAPY("OPTIMISM");

export const fetchAllSubgraphAPYs = async () => {
  const networks = Object.keys(SUBGRAPH_IDS) as Array<
    keyof typeof SUBGRAPH_IDS
  >;

  const results: { chain: string; apy: string }[] = [];

  for (const network of networks) {
    const apy = await fetchSingleSubgraphAPY(network as string);

    if (apy !== null) {
      results.push({
        chain: network.toString(),
        apy: apy.toFixed(2),
      });
    }
  }

  const sorted = results.sort((a, b) => parseFloat(b.apy) - parseFloat(a.apy));

  return sorted;
};

// fetchAllSubgraphAPYs();
