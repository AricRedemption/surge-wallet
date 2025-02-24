import { useState } from "react"
import Vline from "@/assets/svg/vline.svg?react"
import useMultiWalletStore from "@/stores/useMultiWalletStore"
import { TaprootMultisigWallet, Psbt, networks } from "@metalet/utxo-wallet-sdk"
import { truncateStr } from "@/lib/format"
import { unisatApi } from "@/utils/request"
import { UTXO } from "@/types/utxo"
import { addTx } from "@/queries/tx"
import { useNavigate } from "react-router-dom"
import useWalletStore from "@/stores/useWalletStore"
import { useToast } from "@/components/Toast"


export default function SendToken() {
  const { publicKey } = useWalletStore()
  const navigate = useNavigate()
  const toast = useToast()
  const [step, setStep] = useState(0)
  const [address, setAddress] = useState("")
  const [amount, setAmount] = useState<number>()
  const {
    address: multiAddress,
    publicKeys,
    num: needToSign,
  } = useMultiWalletStore()

  const createTx = async () => {
    if (!amount) {
      toast.warn("Please enter amount")
      return
    }
    console.log("publicKeys", publicKeys)

    const amountInSatoshis = amount * 10 ** 8
    console.log("amountInSatoshis", amountInSatoshis)
    setStep(1)
    const psbt = new Psbt({ network: networks.testnet })
    const wallet = new TaprootMultisigWallet(
      publicKeys.map((pubkey) => Buffer.from(pubkey, "hex").subarray(1)),
      needToSign,
    )

    const utxos = await unisatApi<UTXO[]>("/address/btc-utxo", "testnet").get({
      address: multiAddress,
    })

    console.log("utxos", utxos)

    if (!utxos.length) {
      toast.warn("Insufficient balance")
    }

    for (let i = 0; i < utxos.length; i++) {
      wallet.addInput(psbt, utxos[i].txid, utxos[i].vout, utxos[i].satoshis)
    }
    const fee = 3000
    psbt.addOutput({
      value:
        utxos.reduce((total, cur) => total + Number(cur.satoshis), 0) -
        fee -
        amountInSatoshis,
      address: multiAddress,
    })

    psbt.addOutput({
      value: amountInSatoshis,
      address: address,
    })

    const [walletAddress] = await (window.unisat as any).getAccounts()

    const psbtHex = await (window.unisat as any).signPsbt(psbt.toHex(), {
      autoFinalized: false,
      toSignInputs: psbt.data.inputs.map((_, index) => ({
        index,
        address: walletAddress,
        disableTweakSigner: true,
      })),
    })

    await addTx(multiAddress, psbtHex, [publicKey], needToSign.toString())
    navigate("/account/" + multiAddress)
  }

  return (
    <div className="flex w-full flex-col px-4 xl:mx-auto xl:w-[1200px]">
      <h1 className="text-lg font-bold text-white md:text-3xl">
        {step === 1 ? "Confirm Transaction" : "New Transaction"}
      </h1>
      <main className="mt-8 flex w-full">
        <div className="w-full grow rounded-lg bg-[#101111] p-6 md:mr-6">
          {step === 1 ? (
            <div className="w-full">
              <h2 className="mb-6 text-white">Send Tokens</h2>
              <div className="space-y-4">
                <div className="flex flex-col gap-y-2 rounded-2xl bg-[#161717] px-[18px] py-[30px] text-white md:flex-row md:items-center md:gap-x-4">
                  <span className="text-xs md:text-base">Recipient</span>
                  <div className="grow">{truncateStr(address, 6)}</div>
                </div>
                <div className="flex flex-col gap-y-2 rounded-2xl bg-[#161717] px-[18px] py-[30px] text-white md:flex-row md:items-center md:gap-x-4">
                  <span className="text-xs md:text-base">Amount</span>
                  <div className="grow">{amount}</div>
                </div>
                <button
                  onClick={() => createTx()}
                  className="mx-auto mt-8 rounded-3xl bg-[#12FF80] px-4 py-1.5 text-black md:px-8 md:py-3"
                >
                  Confirm
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full">
              <h2 className="mb-6 text-white">Send Tokens</h2>
              <div className="space-y-4">
                <div className="flex flex-col gap-y-2 rounded-2xl bg-[#161717] px-[18px] py-[30px] text-white md:flex-row md:items-center md:gap-x-4">
                  <span className="text-sm md:text-base">Recipient</span>
                  <input
                    placeholder="Enter recipient address"
                    type="text"
                    className="grow bg-transparent text-xs outline-none placeholder:text-xs placeholder:text-white/50"
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-y-2 rounded-2xl bg-[#161717] px-[18px] py-[30px] text-white md:flex-row md:items-center md:gap-x-4">
                  <span className="text-sm md:text-base">Amount</span>
                  <input
                    placeholder="Enter amount"
                    min={0}
                    step={0.00001}
                    type="number"
                    className="grow bg-transparent text-xs outline-none placeholder:text-xs placeholder:text-white/50"
                    onChange={(e) => setAmount(Number(e.target.value))}
                  />
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="mx-auto mt-8 rounded-3xl bg-[#12FF80] px-4 py-1.5 text-xs text-black md:px-8 md:py-3 md:text-base"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="hidden w-1/3 md:block">
          <div className="rounded-lg bg-[#101111] p-6">
            <h2 className="mb-4 text-xl font-semibold">Transaction Status</h2>
            <ul className="space-y-2">
              <li className="flex items-center">
                <span
                  className={[
                    "mr-2 h-2 w-2 rounded-full",
                    step === 0 ? "bg-green-500" : "bg-gray-400",
                  ].join(" ")}
                ></span>
                Create
              </li>
              <Vline className="ml-1" />
              <li className="flex items-center text-white/50">
                <span
                  className={[
                    "mr-2 h-2 w-2 rounded-full",
                    step === 1 ? "bg-green-500" : "bg-gray-400",
                  ].join(" ")}
                ></span>
                Confirmed (1 of 2)
              </li>
              <Vline className="ml-1" />
              <li className="flex items-center text-white/50">
                <span
                  className={[
                    "mr-2 h-2 w-2 rounded-full",
                    step === 2 ? "bg-green-500" : "bg-gray-400",
                  ].join(" ")}
                ></span>
                Execute
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}
