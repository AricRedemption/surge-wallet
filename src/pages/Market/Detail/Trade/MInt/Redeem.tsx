import Decimal from "decimal.js"
import { network } from "@/config"
import { debounce } from "@/lib/utils"
import { useMemo, useState } from "react"
import { useParams } from "react-router-dom"
import { useCurrentWallet } from "@mysten/dapp-kit"
import { Transaction } from "@mysten/sui/transactions"
import AddIcon from "@/assets/images/svg/add.svg?react"
import SwapIcon from "@/assets/images/svg/swap.svg?react"
import SSUIIcon from "@/assets/images/svg/sSUI.svg?react"
import FailIcon from "@/assets/images/svg/fail.svg?react"
import usePyPositionData from "@/hooks/usePyPositionData"
import WalletIcon from "@/assets/images/svg/wallet.svg?react"
import { useCoinConfig, useQueryMintPYRatio } from "@/queries"
import SuccessIcon from "@/assets/images/svg/success.svg?react"
import useCustomSignAndExecuteTransaction from "@/hooks/useCustomSignAndExecuteTransaction"
import {
  AlertDialog,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog"

export default function Mint() {
  const { coinType, maturity } = useParams()
  const [txId, setTxId] = useState("")
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState<string>()
  const [status, setStatus] = useState<"Success" | "Failed">()
  const { currentWallet, isConnected } = useCurrentWallet()
  const [ptRedeemValue, setPTRedeemValue] = useState("")
  const [ytRedeemValue, setYTRedeemValue] = useState("")

  const { mutateAsync: signAndExecuteTransaction } =
    useCustomSignAndExecuteTransaction()

  const address = useMemo(
    () => currentWallet?.accounts[0].address,
    [currentWallet],
  )

  const { data: coinConfig } = useCoinConfig(coinType, maturity)
  const { data: pyPositionData } = usePyPositionData(
    address,
    coinConfig?.pyState,
    coinConfig?.maturity,
  )

  const { data: mintPYRatio } = useQueryMintPYRatio(coinConfig?.marketStateId)
  const ptRatio = useMemo(() => mintPYRatio?.syPtRate ?? 1, [mintPYRatio])
  const ytRatio = useMemo(() => mintPYRatio?.syYtRate ?? 1, [mintPYRatio])

  const ptBalance = useMemo(() => {
    if (pyPositionData?.length) {
      return pyPositionData
        .reduce((total, coin) => total.add(coin.pt_balance), new Decimal(0))
        .div(1e9)
        .toString()
    }
    return 0
  }, [pyPositionData])

  const ytBalance = useMemo(() => {
    if (pyPositionData?.length) {
      return pyPositionData
        .reduce((total, coin) => total.add(coin.yt_balance), new Decimal(0))
        .div(1e9)
        .toString()
    }
    return 0
  }, [pyPositionData])

  const insufficientBalance = useMemo(() => {
    return (
      new Decimal(ptBalance).lt(ptRedeemValue || 0) ||
      new Decimal(ytBalance).lt(ytRedeemValue || 0)
    )
  }, [ptBalance, ytBalance, ptRedeemValue, ytRedeemValue])

  async function redeem() {
    if (
      !insufficientBalance &&
      coinConfig &&
      coinType &&
      address &&
      ptRedeemValue &&
      ytRedeemValue
    ) {
      try {
        const tx = new Transaction()

        let pyPosition
        let created = false
        if (!pyPositionData?.length) {
          created = true
          pyPosition = tx.moveCall({
            target: `${coinConfig.nemoContractId}::py::init_py_position`,
            arguments: [
              tx.object(coinConfig.version),
              tx.object(coinConfig.pyState),
            ],
            typeArguments: [coinConfig.syCoinType],
          })[0]
        } else {
          pyPosition = tx.object(pyPositionData[0].id.id)
        }

        const [priceVoucher] = tx.moveCall({
          target: `${coinConfig.nemoContractId}::oracle::get_price_voucher_from_x_oracle`,
          arguments: [
            tx.object(coinConfig.providerVersion),
            tx.object(coinConfig.providerMarket),
            tx.object(coinConfig.syState),
            tx.object("0x6"),
          ],
          typeArguments: [coinConfig.syCoinType, coinConfig.underlyingCoinType],
        })

        const [sy] = tx.moveCall({
          target: `${coinConfig.nemoContractId}::yield_factory::redeem_py`,
          arguments: [
            tx.object(coinConfig.version),
            tx.pure.u64(new Decimal(ytRedeemValue).mul(1e9).toString()),
            tx.pure.u64(new Decimal(ptRedeemValue).mul(1e9).toString()),
            priceVoucher,
            pyPosition,
            tx.object(coinConfig.pyState),
            tx.object(coinConfig.yieldFactoryConfigId),
            tx.object("0x6"),
          ],
          typeArguments: [coinConfig.syCoinType],
        })

        tx.transferObjects([sy], address)

        if (created) {
          tx.transferObjects([pyPosition], address)
        }

        const { digest } = await signAndExecuteTransaction({
          transaction: tx,
          chain: `sui:${network}`,
        })
        setTxId(digest)
        setOpen(true)
        setPTRedeemValue("")
        setYTRedeemValue("")
        setStatus("Success")
      } catch (error) {
        setOpen(true)
        setStatus("Failed")
        setMessage((error as Error)?.message ?? error)
      }
    }
  }

  const debouncedSetPTValue = debounce((value: string) => {
    setPTRedeemValue(value)
    setYTRedeemValue(new Decimal(value).div(ptRatio).toFixed(9))
  }, 300)

  const debouncedSetYTValue = debounce((value: string) => {
    setYTRedeemValue(value)
    setPTRedeemValue(new Decimal(value).mul(ytRatio).toFixed(9))
  }, 300)

  return (
    <div className="flex flex-col items-center">
      <AlertDialog open={open}>
        <AlertDialogContent className="bg-[#0e0f15] border-none rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center text-white">
              {status}
            </AlertDialogTitle>
            <AlertDialogDescription className="flex flex-col items-center">
              {status === "Success" ? <SuccessIcon /> : <FailIcon />}
              {status === "Success" && (
                <div className="py-2 flex flex-col items-center">
                  <p className=" text-white/50">Transaction submitted!</p>
                  <a
                    className="text-[#8FB5FF] underline"
                    href={`https://suiscan.xyz/${network}/tx/${txId}`}
                    target="_blank"
                  >
                    View details
                  </a>
                </div>
              )}
              {status === "Failed" && (
                <div className="py-2 flex flex-col items-center">
                  <p className=" text-red-400">Transaction Error</p>
                  <p className="text-red-500 break-all">{message}</p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex items-center justify-center">
            <button
              className="text-white w-36 rounded-3xl bg-[#2CA94F] py-1.5"
              onClick={() => setOpen(false)}
            >
              OK
            </button>
          </div>
          <AlertDialogFooter></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <div className="flex flex-col w-full">
        <div className="flex items-center justify-between w-full">
          <div className="text-white">Input</div>
          <div className="flex items-center gap-x-1">
            <WalletIcon />
            <span>Balance: {isConnected ? ptBalance : "--"}</span>
          </div>
        </div>
        <div className="bg-black flex items-center justify-between p-1 gap-x-4 rounded-xl mt-[18px] w-full pr-5">
          <div className="flex items-center py-3 px-3 rounded-xl gap-x-2 bg-[#0E0F16] shrink-0">
            <SSUIIcon className="size-6" />
            <span>PT {coinConfig?.coinName}</span>
            {/* <DownArrowIcon /> */}
          </div>
          <div className="flex flex-col items-end gap-y-1">
            <input
              type="text"
              disabled={!isConnected}
              onChange={(e) =>
                debouncedSetPTValue(new Decimal(e.target.value).toString())
              }
              placeholder={!isConnected ? "Please connect wallet" : ""}
              className={`bg-transparent h-full outline-none grow text-right min-w-0`}
            />
            {isConnected && (
              <span className="text-xs text-white/80">
                $
                {new Decimal(coinConfig?.ptPrice || 0)
                  .mul(ptRedeemValue || 0)
                  .toFixed(2)}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-x-2 justify-end mt-3.5 w-full">
          <button
            className="bg-[#1E212B] py-1 px-2 rounded-[20px] text-xs cursor-pointer"
            disabled={!isConnected}
            onClick={() =>
              setPTRedeemValue(new Decimal(ptBalance).div(2).toFixed(9))
            }
          >
            Half
          </button>
          <button
            className="bg-[#1E212B] py-1 px-2 rounded-[20px] text-xs cursor-pointer"
            disabled={!isConnected}
            onClick={() => setPTRedeemValue(new Decimal(ptBalance).toFixed(9))}
          >
            Max
          </button>
        </div>
      </div>
      <AddIcon className="mx-auto" />
      <div className="flex flex-col w-full mt-[18px]">
        <div className="flex items-center justify-end w-full">
          <div className="flex items-center gap-x-1">
            <WalletIcon />
            <span>Balance: {isConnected ? ytBalance : "--"}</span>
          </div>
        </div>
        <div className="bg-black flex items-center justify-between p-1 gap-x-4 rounded-xl mt-[18px] w-full pr-5">
          <div className="flex items-center py-3 px-3 rounded-xl gap-x-2 bg-[#0E0F16] shrink-0">
            <SSUIIcon className="size-6" />
            <span>YT {coinConfig?.coinName}</span>
            {/* <DownArrowIcon /> */}
          </div>
          <div className="flex flex-col items-end gap-y-1">
            <input
              type="text"
              disabled={!isConnected}
              onChange={(e) =>
                debouncedSetYTValue(new Decimal(e.target.value).toString())
              }
              placeholder={!isConnected ? "Please connect wallet" : ""}
              className={`bg-transparent h-full outline-none grow text-right min-w-0`}
            />
            {isConnected && (
              <span className="text-xs text-white/80">
                $
                {new Decimal(coinConfig?.ptPrice || 0)
                  .mul(ytRedeemValue || 0)
                  .toFixed(2)}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-x-2 justify-end mt-3.5 w-full">
          <button
            className="bg-[#1E212B] py-1 px-2 rounded-[20px] text-xs cursor-pointer"
            disabled={!isConnected}
            onClick={() =>
              setYTRedeemValue(new Decimal(ytBalance).div(2).toFixed(9))
            }
          >
            Half
          </button>
          <button
            className="bg-[#1E212B] py-1 px-2 rounded-[20px] text-xs cursor-pointer"
            disabled={!isConnected}
            onClick={() => setYTRedeemValue(new Decimal(ytBalance).toFixed(9))}
          >
            Max
          </button>
        </div>
      </div>
      <SwapIcon className="mx-auto mt-5" />
      <div className="flex flex-col gap-y-4.5 w-full">
        <div>Output</div>
        <div className="bg-black flex items-center p-1 gap-x-4 rounded-xl w-full pr-5">
          <div className="flex items-center py-3 px-3 rounded-xl gap-x-2 bg-[#0E0F16] shrink-0">
            <SSUIIcon className="size-6" />
            <span>sBTC</span>
            {/* <DownArrowIcon /> */}
          </div>
          <input
            disabled
            type="text"
            value={
              (ptRedeemValue || ytRedeemValue) &&
              Math.min(
                new Decimal(ptRedeemValue || 0).div(ptRatio).toNumber(),
                new Decimal(ytRedeemValue || 0).div(ytRatio).toNumber(),
              ).toFixed(9)
            }
            className="bg-transparent h-full outline-none grow text-right min-w-0"
          />
        </div>
      </div>
      {insufficientBalance ? (
        <div className="mt-7.5 px-8 py-2.5 bg-[#2CA94F]/50 text-white/50 rounded-full w-full h-14 cursor-pointer">
          Insufficient Balance
        </div>
      ) : (
        <button
          onClick={redeem}
          className={[
            "mt-7.5 px-8 py-2.5 rounded-full w-full h-14",
            ptRedeemValue === "" || ytRedeemValue === "" || insufficientBalance
              ? "bg-[#2CA94F]/50 text-white/50 cursor-pointer"
              : "bg-[#2CA94F] text-white",
          ].join(" ")}
          disabled={
            ptRedeemValue === "" || ytRedeemValue === "" || insufficientBalance
          }
        >
          Redeem
        </button>
      )}
    </div>
  )
}
