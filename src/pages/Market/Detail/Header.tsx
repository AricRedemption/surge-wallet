import { IS_DEV } from "@/config"
import { motion } from "framer-motion"
import { truncateStr } from "@/lib/utils"
import { ChevronDown } from "lucide-react"
import { useToast } from "@/components/Toast"
import { useEffect, useRef, useState } from "react"
import { Link, useLocation } from "react-router-dom"

import Squares2X2Icon from "@/assets/images/svg/squares-2x2.svg?react"
import {
  ConnectModal,
  useAccounts,
  useCurrentAccount,
  useCurrentWallet,
  useDisconnectWallet,
  useSwitchAccount,
} from "@mysten/dapp-kit"

export default function Header() {
  const toast = useToast()
  const location = useLocation()
  const accounts = useAccounts()
  const [open, setOpen] = useState(false)
  const currentAccount = useCurrentAccount()
  const { isConnected } = useCurrentWallet()
  const [isOpen, setIsOpen] = useState(false)
  const [isDrop, setIsDrop] = useState(false)
  const { mutate: switchAccount } = useSwitchAccount()
  const { mutate: disconnect } = useDisconnectWallet()

  const subNavRef = useRef<HTMLDivElement>(null)

  const handleClickOutside = (event: MouseEvent) => {
    if (
      subNavRef.current &&
      !subNavRef.current.contains(event.target as Node)
    ) {
      setIsDrop(false)
    }
  }

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <header className="py-6">
      <div className=" w-full mx-auto flex items-center justify-between text-xs">
        <div className="flex items-center gap-x-6">
          <Squares2X2Icon
            className="md:hidden text-white cursor-pointer"
            onClick={() => setIsOpen((isOpen) => !isOpen)}
          />
         
          {isConnected ? (
            <div className="relative" ref={subNavRef}>
              <div
                onClick={() => setIsDrop((isDrop) => !isDrop)}
                className="flex items-center gap-x-1 bg-[#0E0F16] px-3 py-2 rounded-full cursor-pointer"
              >
                <span>{truncateStr(currentAccount?.address || "", 4)}</span>
                <ChevronDown className="size-4" />
              </div>
              {isDrop && (
                <ul className="absolute rounded-lg w-40 right-0 mt-1 overflow-hidden z-10">
                  <li
                    className="cursor-pointer bg-[#0E0F16] px-4 py-2 text-white/50 hover:text-white w-full"
                    onClick={() => {
                      disconnect()
                    }}
                  >
                    Disconnect
                  </li>
                  <li
                    className="cursor-pointer bg-[#0E0F16] px-4 py-2 text-white/50 hover:text-white w-full"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        currentAccount?.address || "",
                      )
                      toast.success("Address copied to clipboard")
                      setIsDrop(false)
                    }}
                  >
                    Copy Address
                  </li>
                  {accounts
                    .filter(
                      (account) => account.address !== currentAccount?.address,
                    )
                    .map((account) => (
                      <li
                        key={account.address}
                        className="cursor-pointer bg-[#0E0F16] px-4 py-2 text-white/50 hover:text-white w-full"
                        onClick={() => {
                          switchAccount(
                            { account },
                            {
                              onSuccess: () =>
                                console.log(`switched to ${account.address}`),
                            },
                          )
                        }}
                      >
                        {truncateStr(account?.address || "", 4)}
                      </li>
                    ))}
                </ul>
              )}
            </div>
          ) : (
            <ConnectModal
              open={open}
              onOpenChange={(isOpen) => setOpen(isOpen)}
              trigger={
                <button
                  disabled={!!currentAccount}
                  className="text-white outline-none py-2 px-3 rounded-3xl bg-[#0052F2]"
                >
                  Connect Wallet
                </button>
              }
            />
          )}
        </div>
      </div>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        style={{ overflow: "hidden" }}
        className="flex gap-x-8 text-sm md:hidden"
      >
        <div className="flex flex-col">
          <Link to="/market" className="py-2 text-white">
            Markets
          </Link>
          <Link to="/portfolio" className="py-2 cursor-pointer text-white">
            Portfolio
          </Link>
          <Link to="/learn" className="py-2 text-white">
            Learn
          </Link>
          {IS_DEV && (
            <Link to="/test" className="py-2 text-white">
              Test
            </Link>
          )}
        </div>
      </motion.div>
    </header>
  )
}