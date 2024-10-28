import { ArrowRight } from "lucide-react";
import _btc from "@/assets/svg/bitcoin.svg";
import { Input } from "@/components/ui/input"
import { useCallback, useEffect, useMemo, useState } from "react";
import Decimal from "decimal.js";
const multiSigAddress='bc1qckg80zxgk2jm5gqlxnj54c2zfxc95tqfvvrvc9'
export default function Stake() {
    const [bal, setBal] = useState("0.000")
    const [stake, setStake] = useState("0.000")
    const _getBal = useCallback(async () => {
        const res = await window.unisat.getBalance();
        console.log(res)
        setBal((res.total/1e8).toFixed(8))
    }, [])
    useEffect(() => {
        _getBal()
    }, [_getBal])

    const handleStake = async ()=>{
        try{
            let accounts = await window.unisat.requestAccounts();
        }catch(e){
            console.log(e)
            console.log('connect failed');
            return
        }
        // 1 staking to babylon
        // 2 transfer btc to multisig address
        
        const res = await window.unisat.sendBitcoin(multiSigAddress,new Decimal(stake).mul(1e8).toNumber())
        console.log(res)
    }
    return <div>
        <div className="flex items-center gap-6 flex-col lg:flex-row">
            <div className="flex-1">
                <div className="flex items-center justify-between ">
                    <div className="text-sm">
                        You Will Stake
                    </div>
                    <div className="text-sm">
                        Balance: <span className="text-[#12FF80] cursor-pointer " onClick={()=>{
                            setStake(bal)
                        }}>{bal}</span> BTC
                    </div>
                </div>
                <div className="mt-4 flex border-slate-400 rounded-sm border px-3 gap-2">


                    <Input type="" placeholder="0.00" value={stake} onChange={(e) => setStake((e.target.value))} className="outline-none border-none dark:outline-none !important" />
                    <div className="flex items-center gap-2">
                        <div className="text-sm">BTC</div>
                        <img src={_btc} alt="" />
                    </div>

                </div>
            </div>

            <ArrowRight />
            <div className="flex-1">
                <div className="flex items-center justify-between flex-1">
                    <div className="text-sm">
                        You Will Receive
                    </div>
                    <div className="text-sm">

                    </div>
                </div>
                <div className="mt-4 flex border-slate-400 rounded-sm border px-3 gap-2">


                    <Input type="" placeholder="0.00" value={stake} className="outline-none border-none" disabled />
                    <div className="flex items-center gap-2">
                        <div className="text-sm">vBTC</div>
                        <img src={_btc} alt="" />
                    </div>

                </div>
            </div>

        </div>
        <div className="flex flex-row-reverse">
            <button
                onClick={handleStake}
                className="rounded-full border border-[#12FF80] bg-[#12FF80] px-4 py-1.5 text-sm text-black md:px-8 md:py-3 mt-4"
            >
                Next
            </button>
        </div>

    </div>
}