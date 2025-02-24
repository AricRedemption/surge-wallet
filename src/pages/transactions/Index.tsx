import { Tx, getTxList } from "@/queries/tx"
import { truncateStr } from "@/lib/format"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { useNavigate } from "react-router-dom"
import useWalletStore from "@/stores/useWalletStore"
import BitcoinIcon from "@/assets/svg/bitcoin.svg?react"
import dayjs from "dayjs"

export default function Account() {
  const navigate = useNavigate()
  const { publicKey } = useWalletStore()
  const [txs, setTxs] = useState<Tx[]>([])
  const [loading, setLoading] = useState(true)
  const { address: multiAddress } = useParams()

  useEffect(() => {
    if (multiAddress) {
      const txs = getTxList(multiAddress)
      setTxs(txs)
      setLoading(false)
    }
  }, [multiAddress])
  return (
    <div className="mt-8 flex w-full flex-col items-center justify-center px-4 text-white md:mt-24 md:max-w-[1200px] md:px-0">
      <div className="md:mt-30 flex w-full items-center justify-between">
        <h4 className="md:text-lg">My Transactions</h4>
        <button
          className="rounded-full border border-electric-green px-2.5 py-1.5 text-sm text-electric-green md:px-5 md:py-3 md:text-base"
          onClick={() => navigate("/user/transaction-section")}
        >
          New Transaction
        </button>
      </div>
      <div className="mt-6 w-full space-y-2 rounded-2xl bg-[#121314] px-1 py-3 md:mt-10 md:px-2 md:py-6">
        {loading ? (
          <div className="py-6 text-center">Loading...</div>
        ) : (
          <>
            {txs.length === 0 ? (
              <div className="py-6 text-center text-gray-400">
                No transaction data available
              </div>
            ) : (
              txs.map((tx: Tx, index: number) => (
                <div
                  key={index}
                  className={[
                    "flex w-full items-center justify-between rounded-3xl px-6 hover:bg-black/50",
                    tx.pubKeys.length < Number(tx.needToSign)
                      ? "cursor-pointer"
                      : "cursor-not-allowed",
                  ].join(" ")}
                  onClick={() => {
                    if (
                      tx.pubKeys.length < Number(tx.needToSign) &&
                      !tx.pubKeys.includes(publicKey)
                    ) {
                      navigate("/user/tx/detail/" + tx.id)
                    }
                  }}
                >
                  <div className="flex items-center gap-4 py-6">
                    <div className="size-6 rounded-full bg-white md:size-12"></div>
                    <div>
                      <div className="text-xs md:text-base">
                        {dayjs(Number(tx.timestamp)).format(
                          "YYYY-MM-DD HH:mm:ss",
                        )}
                      </div>
                      <div className="text-sm md:text-lg">
                        {truncateStr(tx.multiAddress, 6)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-x-4">
                    <div className="flex flex-col items-end gap-x-2">
                      <div className="flex items-center gap-x-2 md:gap-x-4">
                        <BitcoinIcon className="md:scale-150" />
                        <span className="text-sm md:text-lg">Bitcoin</span>
                      </div>

                      {tx.txId ? (
                        <a
                          href={`https://mempool.space/zh/testnet/tx/${tx.txId}`}
                          target="_blank"
                          className="mt-1 text-xs underline"
                        >
                          {truncateStr(tx.txId, 4)}
                        </a>
                      ) : (
                        <span className="rounded-xl bg-black p-2 text-xs">
                          {tx.pubKeys.includes(publicKey)
                            ? "Singed"
                            : "Need Sign"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  )
}
