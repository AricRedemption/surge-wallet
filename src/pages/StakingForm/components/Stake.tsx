import { ArrowDown } from "lucide-react"
import _btc from "@/assets/svg/bitcoin.svg"
import { Input } from "@/components/ui/input"
import { useCallback, useEffect, useState } from "react"
import Decimal from "decimal.js"
import { getFinalityProviders } from "@/queries/staking"
const multiSigAddress = "bc1qckg80zxgk2jm5gqlxnj54c2zfxc95tqfvvrvc9"
export default function Stake() {
  const [bal, setBal] = useState("0.000")
  const [stake, setStake] = useState("0.000")
  const [fps, setFps] = useState([])
  const _getFps = useCallback(async () => {
    const res = await getFinalityProviders()
    console.log(res)
    setFps(res.data)
  }, [])
  const _getBal = useCallback(async () => {
    const res = await window.unisat.getBalance()
    console.log(res)
    setBal((res.total / 1e8).toFixed(8))
  }, [])
  useEffect(() => {
    _getBal()
    _getFps()
  }, [_getBal, _getFps])

  const handleStake = async () => {
    try {
      const res = await window.unisat.sendBitcoin(
        multiSigAddress,
        new Decimal(stake).mul(1e8).toNumber(),
      )
      console.log(res)
    } catch (e) {
      console.log(e)
      console.log("connect failed")
      return
    }
    // 1 staking to babylon
    // 2 transfer btc to multisig address
  }
  return (
    <div className="flex h-full flex-col rounded-2xl border border-neutral-content p-4 dark:border-neutral-content/20">
      <h3 className="my-5 font-bold">Staking</h3>
      <div className="flex flex-col items-center gap-6 lg:flex-col">
        <div className="w-full flex-1">
          <div className="flex items-center justify-between">
            <div className="text-sm">You Will Stake</div>
            <div className="text-sm">
              Balance:{" "}
              <span
                className="cursor-pointer text-[#12FF80]"
                onClick={() => {
                  setStake(bal)
                }}
              >
                {bal}
              </span>{" "}
              BTC
            </div>
          </div>
          <div className="mt-4 flex gap-2 rounded-sm border border-slate-400 px-3">
            <Input
              type=""
              placeholder="0.00"
              value={stake}
              onChange={(e) => setStake(e.target.value)}
              className="!important border-none outline-none dark:outline-none"
            />
            <div className="flex items-center gap-2">
              <div className="text-sm">BTC</div>
              <img src={_btc} alt="" />
            </div>
          </div>
        </div>

        <ArrowDown />
        <div className="w-full flex-1">
          <div className="flex flex-1 items-center justify-between">
            <div className="text-sm">You Will Receive</div>
            <div className="text-sm"></div>
          </div>
          <div className="mt-4 flex gap-2 rounded-sm border border-slate-400 px-3">
            <Input
              type=""
              placeholder="0.00"
              value={stake}
              className="border-none outline-none"
              disabled
            />
            <div className="flex items-center gap-2">
              <div className="text-sm">sBTC</div>
              <img src={_btc} alt="" />
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-1 items-end justify-center">
        <button
          onClick={handleStake}
          className="mt-4 w-full rounded-full border border-[#12FF80] bg-[#12FF80] px-4 py-1.5 text-sm text-black md:px-8 md:py-3"
        >
          Next
        </button>
      </div>
    </div>
  )
}
