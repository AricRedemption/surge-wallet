import { truncateStr } from "@/lib/format"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import AddIcon from "@/assets/svg/add.svg?react"
import { getAccountList } from "@/queries/account"
import useWalletStore from "@/stores/useWalletStore"
import BitcoinIcon from "@/assets/svg/bitcoin.svg?react"
import useMultiWalletStore from "@/stores/useMultiWalletStore"

export default function Account() {
  const navigate = useNavigate()

  const { publicKey } = useWalletStore()
  const [loading, setLoading] = useState(true)
  const [accounts, setAccounts] = useState([])
  const { setAddress, setPublicKeys, setNum } = useMultiWalletStore()

  useEffect(() => {
    if (publicKey) {
      getAccountList(publicKey).then((accounts: any) => {
        console.log("accounts", accounts)
        setAccounts(accounts)
        setLoading(false)
      })
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
          {accounts.map((account: any, index: number) => (
            <div
              key={index}
              className="flex w-full cursor-pointer items-center justify-between rounded-3xl px-2 hover:bg-black/50 md:px-6"
              onClick={() => {
                setNum(account.num)
                setAddress(account.md)
                setPublicKeys(account.pubs)
                navigate("/account/" + account.md)
              }}
            >
              <div className="flex items-center gap-4 py-3 md:py-6">
                <div className="size-8 rounded-full bg-white md:size-12"></div>
                <div className="text-xs md:text-sm">
                  <div>{account.name}</div>
                  <div>{truncateStr(account.md, 6)}</div>
                </div>
              </div>
              <div className="hidden items-center gap-x-4 md:flex">
                <BitcoinIcon className="scale-150" />
                <span className="text-lg">Bitcoin</span>
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
