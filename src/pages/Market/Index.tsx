import dayjs from "dayjs"
import Decimal from "decimal.js"

import { useCoinInfoList } from "@/queries"
import PieChart from "./components/PieChart.tsx"
import { useNavigate } from "react-router-dom"
// import StarIcon from "@/assets/images/svg/star.svg?react"
import Logo from "@/assets/images/svg/market/logo.svg?react"
import "@mysten/dapp-kit/dist/index.css"

export default function Market() {
  const navigate = useNavigate()
  const { data: list } = useCoinInfoList()

  return (
    <>
      <div className="relative py-10 xl:mx-auto xl:max-w-[1200px]">
        <div className="flex items-center justify-between">
          <h3 className="text-[28px] text-white">Market</h3>
          <Logo />
        </div>
        <div className="mt-[23px] grid grid-cols-1 gap-5 transition-all duration-1000 ease-in-out md:grid-cols-2 xl:grid-cols-3">
          {list?.map((item) => (
            <div
              key={item.coinAddress + "_" + item.maturity}
              className="rounded-[21.544px] bg-[#0E0F16] p-5"
            >
              <div className="flex items-center justify-between">
                <div className="flex flex-col items-start gap-y-2.5">
                  <div className="flex items-center gap-x-2">
                    <h6 className="text-white">{item.coinName}</h6>
                    {/* <StarIcon />
                    <div className="rounded-3xl px-2 py-0.5 border border-[#71D0FF] text-xs text-[#71D0FF] cursor-pointer">
                      Info
                    </div> */}
                  </div>
                  <div className="flex items-center gap-x-2 rounded-full bg-[#1A1B27] px-2 py-1">
                    <img
                      alt="scallop"
                      className="block size-4"
                      src={item.providerLogo}
                    />
                    <span className="text-xs">{item.provider}</span>
                  </div>
                </div>
                <div className="relative">
                  <img
                    src={item.coinLogo}
                    alt={item.coinName}
                    className="size-14"
                  />
                  <img
                    alt="scallop"
                    className="absolute -bottom-1 -right-1 block size-4"
                    src={item.providerLogo}
                  />
                </div>
              </div>
              <div className="mt-6 space-y-2">
                <div className="flex items-center justify-between">
                  <h6 className="text-xs text-[#576682]">Maturity</h6>
                  {item.maturity && (
                    <div className="shrink-0 text-xs text-white">
                      <span className="font-bold">
                        {dayjs(parseInt(item.maturity)).format("DD MMM YYYY")}
                      </span>
                      <span className="ml-2 text-[#576682]">
                        {dayjs(parseInt(item.maturity)).diff(dayjs(), "day")}
                        &nbsp; DAYS
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#576682]">TVL</span>
                  <div className="flex items-center gap-x-2">
                    <span className="text-xs font-bold text-white">
                      ${item.tvl.toLocaleString()}
                    </span>
                    <PieChart
                      tvl={item.tvl}
                      cap={item.cap}
                      decimal={item.decimal}
                      price={item.underlyingPrice}
                    />
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-between rounded-xl bg-[#131520] p-4">
                  <div className="flex flex-col gap-y-1">
                    <div className="mt-1 text-center text-white">
                      ${item.underlyingPrice.toLocaleString()}
                    </div>
                    <div className="text-center text-xs text-[#576682]">
                      Underlying Price
                    </div>
                  </div>
                  <div className="flex flex-col gap-y-1">
                    <div className="mt-1 text-center text-white">
                      {new Decimal(item.underlyingApy).mul(100).toFixed(2)}%
                    </div>
                    <div className="text-center text-xs text-[#576682]">
                      Underlying Apy
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-3.5">
                <h6 className="text-xs text-white">Trade</h6>
                <div className="mt-2.5 grid grid-cols-2 gap-x-4">
                  <div
                    className="flex h-14 cursor-pointer items-center justify-between rounded-xl border border-transparent bg-[#2CA94F] px-2 py-1.5 pl-5 pr-3 hover:border-white"
                    onClick={() =>
                      navigate(
                        `/market/detail/${item.coinAddress}/${item.maturity}/swap/buy/yt`,
                      )
                    }
                  >
                    <span className="text-sm text-white">YT</span>
                    <div className="flex flex-col items-end">
                      <span className="text-base text-white">
                        {new Decimal(item.ytApy).toFixed(2)}%
                      </span>
                      <span className="text-xs text-white">
                        ${item.ytPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div
                    className="flex h-14 cursor-pointer items-center justify-between rounded-xl border border-transparent bg-gray-300 px-4 py-3 pl-5 pr-3 text-black hover:border-white"
                    onClick={() =>
                      navigate(
                        `/market/detail/${item.coinAddress}/${item.maturity}/swap/buy/pt`,
                      )
                    }
                  >
                    <span className="text-sm">PT</span>
                    <div className="flex flex-col items-end">
                      <span className="text-base">
                        {new Decimal(Number(item.ptApy)).toFixed(2)}%
                      </span>
                      <span className="text-xs">
                        ${item.ptPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-3.5">
                <h6 className="text-xs">Earn</h6>
                <button
                  className="mt-2.5 flex h-14 w-full cursor-pointer items-center justify-between rounded-xl border border-transparent bg-[#e9983d] px-4 py-3 text-sm text-black hover:border-white"
                  onClick={() =>
                    navigate(
                      `/market/detail/${item.coinAddress}/${item.maturity}/liquidity`,
                    )
                  }
                >
                  <span>+ POOL APY</span>
                  <span className="text-base">
                    {new Decimal(item.poolApy).toFixed(2)}%
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
