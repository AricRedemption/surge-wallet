import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Card,
    CardContent
} from "@/components/ui/card"
import Stake from "./components/Stake"

export const StakingForm = () => {
    return (
        <div className="mt-6 flex w-full max-w-[1200px] flex-col items-center justify-center px-4 text-white md:mx-auto md:mt-24 md:px-0">
            <h4 className="w-full text-base md:text-lg">Staking BTC Babylon</h4>
            <p className="w-full text-sm mt-4">Share BTC Security With PoS Chains With Babylon & Earn Yields on Your Bitcoin
            </p>
            <Card className="w-full mt-4">
                <CardContent className="w-full">
                    <Tabs defaultValue="stake" className="mt-4">
                        <TabsList >
                            <TabsTrigger value="stake">Stake</TabsTrigger>
                            <TabsTrigger value="unstake">Unstake</TabsTrigger>
                            <TabsTrigger value="details">History</TabsTrigger>
                        </TabsList>
                        <TabsContent value="stake">
                            <Stake />
                        </TabsContent>
                        <TabsContent value="unstake">Unstake.</TabsContent>
                        <TabsContent value="details">No history found.</TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

        </div>
    )
}