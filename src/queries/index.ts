import { surgeApi } from "./request"
import { useQuery } from "@tanstack/react-query"
import _btc from "@/assets/svg/bitcoin.svg"
import _logo from "@/assets/svg/Logo.svg"
import {
  CoinInfo,
  CoinConfig,
  FixedReturnItem,
  PortfolioItem,
} from "./types/market"

async function getCoinInfoList(name = "", address = "") {
  const ret = await surgeApi<CoinInfo[]>("/api/v1/market/coinInfo").get({
    name,
    address,
  })
  console.log(ret, "surgeApi")
  return ret.slice(0, 2).map((item) => {
    return {
      ...item,
      coinName: "sBTC",
      coinLogo: _btc,
      provider: "Surge",
      providerLogo: _logo,
    }
  })
}

function getFixedReturnInfos() {
  return surgeApi<FixedReturnItem[]>("/api/v1/fixReturn/detail").get()
}

export function useQueryFixedReturnInfos() {
  return useQuery({
    queryKey: ["FixedReturnInfos"],
    queryFn: () => getFixedReturnInfos(),
  })
}

async function getCoinConfig(coinType: string, maturity: string) {
  // const headers = new Headers()
  // if (address) {
  //   headers.set("userAddress", address)
  // }
  const ret = await surgeApi<CoinConfig>("/api/v1/market/config/detail").get(
    {
      coinType,
      maturity,
    },
    // headers,
  )
  console.log(ret, "surgeApi")
  return {
    ...ret,
    coinName: "sBTC",
    coinLogo: _btc,
    provider: "Surge",
    providerLogo: _logo,
  }
}

function getPortfolioList() {
  return surgeApi<PortfolioItem[]>("/api/v1/portfolio/detail").get()
}

async function getMintLpAmount(
  marketStateId: string,
  syCoinAmount: string,
  ptCoinAmount: string,
) {
  const { amount } = await surgeApi<{ amount: string }>(
    "/api/v1/market/lp/mintConfig",
  ).get({
    marketStateId,
    syCoinAmount,
    ptCoinAmount,
  })
  return amount
}

async function getSwapRatio(marketStateId: string, tokenType: string) {
  return await surgeApi<string>("/api/v1/market/swap/exchangeRate").get({
    marketStateId,
    tokenType,
  })
}

interface MintPYResult {
  syPtRate: number
  syYtRate: number
}

async function getMintPYRatio(marketStateId: string) {
  return await surgeApi<MintPYResult>("/api/v1/market/py/mintConfig").get({
    marketStateId,
  })
}

export function useQueryMintPYRatio(marketStateId?: string) {
  return useQuery({
    queryKey: ["mintPYRatio", marketStateId],
    queryFn: () => getMintPYRatio(marketStateId!),
    enabled: !!marketStateId,
  })
}

interface LPResult {
  syLpRate: number
  splitRate: number
}

async function getLPRatio(
  marketStateId: string,
  // address: string,
  mintType?: string,
) {
  // const headers = new Headers()
  // headers.set("userAddress", address)
  return await surgeApi<LPResult>("/api/v1/market/lp/mintConfig").get(
    {
      marketStateId,
      mintType,
    },
    // headers,
  )
}

export function useQueryMintLpAmount(
  marketStateId: string,
  syCoinAmount: string,
  ptCoinAmount: string,
  enabled: boolean,
) {
  return useQuery({
    queryKey: ["coinInfoList", marketStateId, syCoinAmount, ptCoinAmount],
    queryFn: () => getMintLpAmount(marketStateId, syCoinAmount, ptCoinAmount),
    enabled,
  })
}

export function useQuerySwapRatio(marketStateId?: string, tokenType?: string) {
  return useQuery({
    // FIXME： queryKey dose not work
    queryKey: ["swapRatio", marketStateId, tokenType],
    queryFn: () => getSwapRatio(marketStateId!, tokenType!),
    refetchInterval: 1000 * 30,
    enabled: !!marketStateId && !!tokenType,
  })
}

export function useQueryLPRatio(marketStateId?: string, mintType?: string) {
  return useQuery({
    // FIXME： queryKey dose not work
    queryKey: ["lpRatio", marketStateId, mintType],
    queryFn: () => getLPRatio(marketStateId!, mintType),
    enabled: !!marketStateId,
    refetchInterval: 1000 * 30,
  })
}

export function useCoinConfig(
  coinType?: string,
  maturity?: string,
  address?: string,
) {
  return useQuery({
    enabled: !!coinType && !!maturity,
    // FIXME： queryKey dose not work
    queryKey: ["coinConfig", coinType, maturity, address],
    queryFn: () => getCoinConfig(coinType!, maturity!),
  })
}

export function usePortfolioList() {
  return useQuery({
    // FIXME： queryKey dose not work
    queryKey: ["PortfolioConfig"],
    queryFn: () => getPortfolioList(),
  })
}

export function useCoinInfoList(name = "", address = "") {
  return useQuery({
    // FIXME： queryKey dose not work
    queryKey: ["coinInfoList", name, address],
    queryFn: () => getCoinInfoList(name, address),
  })
}
