import Send from "@/assets/svg/send.svg?react"
import Swap from "@/assets/svg/swap.svg?react"
import { useToast } from "@/components/Toast"
import { useNavigate } from "react-router-dom"
import useMultiWalletStore from "@/stores/useMultiWalletStore"
import { useEffect } from "react"

export default function Transaction() {
  const toast = useToast()
  const navigate = useNavigate()
  const { address } = useMultiWalletStore()

  useEffect(() => {
    if (!address) {
      navigate("/accounts")
    }
  }, [address, navigate])

  function sendToken() {
    navigate("/user/transaction/send")
  }

  function swapToken() {
    toast.info("Coming soon!")
  }

  return (
    <div className="w-full px-4 xl:mx-auto xl:w-[1200px]">
      <h1 className="text-lg text-white md:text-[28px]">New Transaction</h1>
      <div className="mt-10 flex h-[450px] w-full flex-col items-center rounded-3xl bg-[#101111] text-white md:flex-row md:justify-between md:pl-[56px] md:pr-[132px]">
        <div className="flex flex-col items-center gap-y-1">
          <img
            src="/public/assets/images/new-transaction.svg"
            className="w-32 md:w-64"
          />
          <span className="hidden md:block md:text-2xl">New transaction</span>
        </div>
        <div className="mt-4 flex w-full flex-col gap-y-6 px-2 text-black md:w-auto">
          <span className="hidden text-white md:block">Manage Assets</span>
          <button
            className="flex w-full items-center justify-center gap-x-2 rounded-2xl bg-[#12FF80] py-6 md:w-[380px]"
            onClick={sendToken}
          >
            <Send />
            <span>Send Token</span>
          </button>
          <button
            className="flex w-full items-center justify-center gap-x-2 rounded-2xl bg-[#12FF80] py-6 md:w-[380px]"
            onClick={swapToken}
          >
            <Swap />
            Swap Tokens
          </button>
          <span className="hidden text-white md:block">
            Interact with contracts
          </span>
          <button
            className="flex items-center justify-center gap-x-2 rounded-2xl border border-white py-6 text-white md:w-[380px]"
            onClick={swapToken}
          >
            <Swap />
            Transaction Builder
          </button>
        </div>
      </div>
    </div>
  )
}
