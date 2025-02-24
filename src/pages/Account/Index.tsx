import { truncateStr } from "@/lib/format"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import AddIcon from "@/assets/svg/add.svg?react"
import { getAccountList } from "@/queries/account"
import useWalletStore from "@/stores/useWalletStore"
import BitcoinIcon from "@/assets/svg/bitcoin.svg?react"
import useMultiWalletStore from "@/stores/useMultiWalletStore"
import { FiCopy } from "react-icons/fi"
import { unisatApi } from "@/utils/request"
import { UTXO } from "@/types/utxo"
import { Account } from "@/queries/account"

export default function AccountComponent() {
  const navigate = useNavigate()

  const { publicKey } = useWalletStore()
  const [loading, setLoading] = useState(true)
  const [accounts, setAccounts] = useState<Account[]>([])
  const { setAddress, setPublicKeys, setNum } = useMultiWalletStore()
  const [balances, setBalances] = useState<{[key: string]: number}>({})

  useEffect(() => {
    if (publicKey) {
      const accounts = getAccountList(publicKey);
      setAccounts(accounts);

      console.log("accounts", accounts)
      
      // Fetch balances for each account
      accounts.forEach(async (account) => {
        const utxos = await unisatApi<UTXO[]>("/address/btc-utxo", "testnet").get({
          address: account.multiAddress,
        })
        const balance = utxos.reduce((total, utxo) => total + Number(utxo.satoshis), 0) / 10**8
        setBalances(prev => ({...prev, [account.multiAddress]: balance}))
      })
      
      setLoading(false);
    }
  }, [publicKey])
  return (
    <div className="mt-6 flex flex-col items-center justify-center px-4 text-white md:mt-24 xl:mx-auto xl:max-w-[1200px] xs:mt-12">
      <div className="mt-30 flex w-full items-center justify-between">
        <h4 className="text-base md:text-lg">Surge Accounts</h4>
        <button
          className="rounded-full border border-electric-green px-2.5 py-1.5 text-xs text-electric-green md:px-5 md:py-3 md:text-base"
          onClick={() => navigate("/account/create")}
        >
          Create Account
        </button>
      </div>
      {loading ? (
        <div className="mt-4 w-full rounded-2xl bg-[#121314] py-6 text-center">
          Loading...
        </div>
      ) : (
        <div className="mt-4 w-full space-y-2 rounded-2xl bg-[#121314] px-2 py-3 md:mt-10 md:py-6">
          <h6 className="my-2 px-2 text-sm md:px-6 md:text-base">
            My Accounts ({accounts.length})
          </h6>
          {accounts.map((account: Account, index: number) => (
            <div
              key={index}
              className="flex w-full cursor-pointer items-center justify-between rounded-3xl px-2 hover:bg-black/50 md:px-6"
              onClick={() => {
                setNum(account.num)
                setAddress(account.multiAddress)
                setPublicKeys(account.pubKeys)
                navigate("/account/" + account.multiAddress)
              }}
            >
              <div className="flex items-center gap-4 py-3 md:py-6">
                <div className="size-8 rounded-full bg-white md:size-12"></div>
                <div className="text-xs md:text-sm">
                  <div>{account.name}</div>
                  <div className="flex items-center gap-1">
                    {truncateStr(account.multiAddress, 6)}
                    <button
                      className="rounded bg-gray-700 p-1 hover:bg-gray-600"
                      onClick={(e) => {
                        e.stopPropagation()
                        navigator.clipboard.writeText(account.multiAddress)
                      }}
                      aria-label="Copy address"
                    >
                      <FiCopy className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="hidden items-center gap-x-4 md:flex">
                <BitcoinIcon className="scale-150" />
                <span className="text-lg">{balances[account.multiAddress]?.toFixed(8) || '0.00000000'} BTC</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 hidden w-[1000px] rounded-3xl bg-[#121314] p-6">
        <div className="flex items-center justify-between">
          <h6>Watchlist</h6>
          <button className="flex items-center rounded-full border bg-white/5 px-2.5 py-1 text-sm">
            <AddIcon />
            <span>Add coins</span>
          </button>
        </div>
        <p className="py-16 text-center text-white/50">
          Watch any Watch any Surge Account to keep an eye on its activity to
          keep an eye on its activity
        </p>
      </div>
    </div>
  )
}
