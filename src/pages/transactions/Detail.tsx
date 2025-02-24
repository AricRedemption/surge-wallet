import { useEffect, useState } from "react"
import Vline from "@/assets/svg/vline.svg?react"
import useMultiWalletStore from "@/stores/useMultiWalletStore"
import { TaprootMultisigWallet, Psbt, networks } from "@metalet/utxo-wallet-sdk"
import { unisatApi } from "@/utils/request"
import { getOrder, overTx, updateTx } from "@/queries/tx"
import { useNavigate, useParams } from "react-router-dom"
import useWalletStore from "@/stores/useWalletStore"

export default function SendToken() {
  const navigate = useNavigate()
  const { publicKey } = useWalletStore()
  const { publicKeys, num } = useMultiWalletStore()
  console.log(publicKeys, num)
  if (publicKeys.length === 0) {
    navigate("/accounts")
  }

  const { orderId } = useParams()
  const [psbtHex, setPsbtHex] = useState<string>()
  const [txid, setTxid] = useState("")
  const [objectId, setObjectId] = useState("")

  useEffect(() => {
    if (orderId) {
      const order = getOrder(orderId)
      if (order.length > 0) {
        setPsbtHex(order[0].currentPsbt)
        setObjectId(order[0].id)
      } else {
        navigate("/404")
      }
    }
  }, [navigate, orderId])

  const signTx = async () => {
    if (publicKeys.length === 0) {
      return
    }
    const wallet = new TaprootMultisigWallet(
      publicKeys.map((pubkey) => Buffer.from(pubkey, "hex").subarray(1)),
      num,
    )
    console.log("psbtHex", psbtHex)
    let psbt = Psbt.fromHex(psbtHex!, { network: networks.testnet })

    const [walletAddress] = await (window.unisat as any).getAccounts()

    const _psbtHex = await (window.unisat as any).signPsbt(psbt.toHex(), {
      autoFinalized: false,
      toSignInputs: psbt.data.inputs.map((_, index) => ({
        index,
        address: walletAddress,
        disableTweakSigner: true,
      })),
    })

    psbt = Psbt.fromHex(_psbtHex!, { network: networks.testnet })
    wallet.addDummySigs(psbt)

    // Update transaction with new signature

    const order = getOrder(orderId!)[0]
    // Only broadcast if we have enough signatures
    if (order.pubKeys.length + 1 >= Number(order.needToSign)) {
      psbt.finalizeAllInputs()
      const rawTx = psbt.extractTransaction().toHex()

      const txid = await unisatApi<string>("/tx/broadcast", "testnet").post({
        rawtx: rawTx,
      })

      setTxid(txid)
      overTx(orderId!, txid)

      window.open(`https://mempool.space/zh/testnet/tx/${txid}`, "_blank")
    } else {
      updateTx(orderId!, _psbtHex, publicKey)
      navigate(-1)
    }
  }

  return (
    <div className="flex w-full flex-col px-4 xl:mx-auto xl:w-[1200px] xl:px-0">
      <h1 className="text-lg font-bold text-white md:text-3xl">
        Sign Transaction
      </h1>

      <main className="mt-2 flex flex-grow">
        <div className="w-full grow rounded-lg bg-[#101111] md:mr-6">
          {txid ? (
            <div className="flex flex-col items-center justify-center gap-y-4 p-4">
              <a
                target="_blank"
                className="text-lg text-white underline"
                href={`https://mempool.space/zh/testnet/tx/${txid}`}
              >
                view on mempool
              </a>
              <button
                onClick={() => navigate(-1)}
                className="rounded-3xl bg-[#12FF80] px-4 py-1.5 text-black md:px-8 md:py-3"
              >
                Confirm
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col gap-y-4 rounded-2xl bg-[#161717] px-[18px] py-[30px] text-white">
                <span>PSBT Hex</span>
                <div className="h-96 grow overflow-y-auto break-all p-2">
                  {psbtHex}
                </div>
              </div>
              <button
                onClick={() => signTx()}
                className="mx-auto mt-8 rounded-3xl bg-[#12FF80] px-4 py-1.5 text-black md:px-8 md:py-3"
              >
                Sign
              </button>
            </div>
          )}
        </div>
        <div className="hidden w-1/3">
          <div className="rounded-lg bg-[#101111] p-6">
            <h2 className="mb-4 text-xl font-semibold">Transaction Status</h2>
            <ul className="space-y-2">
              <li className="flex items-center">
                <span className="mr-2 h-2 w-2 rounded-full bg-green-500"></span>
                Create
              </li>
              <Vline className="ml-1" />
              <li className="flex items-center text-white/50">
                <span className="mr-2 h-2 w-2 rounded-full bg-gray-400"></span>
                Confirmed (1 of 2)
              </li>
              <Vline className="ml-1" />
              <li className="flex items-center text-white/50">
                <span className="mr-2 h-2 w-2 rounded-full bg-gray-400"></span>
                Execute
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}
