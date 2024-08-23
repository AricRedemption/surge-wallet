import Info from "./components/Info"
import Sign from "./components/Sign"
import Review from "./components/Review"
import { useEffect, useState } from "react"
import { useToast } from "@/components/Toast"
import InfoIcon from "@/assets/svg/info.svg?react"
import SignIcon from "@/assets/svg/sign.svg?react"
import useWalletStore from "@/stores/useWalletStore"
import ReviewIcon from "@/assets/svg/review.svg?react"
import StepArrowIcon from "@/assets/svg/step-arrow.svg?react"

export default function Create() {
  const toast = useToast()
  const { publicKey } = useWalletStore()

  const [step, setStep] = useState(1)
  const [name, setName] = useState("")
  const [signerNum, setSignerNum] = useState(1)
  const [publicKeys, setPublicKeys] = useState<string[]>([])

  useEffect(() => {
    if (publicKey && !publicKeys.includes(publicKey)) {
      publicKeys.push(publicKey)
      setPublicKeys(publicKeys)
    }
  }, [publicKey, publicKeys])

  const preStep = () => {
    if (step === 1) {
      return
    } else {
      setStep(step - 1)
    }
  }
  const nextStep = () => {
    if (step === 3) {
      return
    } else {
      if (step === 1 && !name) {
        toast.warn("Please enter a name")
        return
      }
      setStep(step + 1)
    }
  }
  return (
    <div className="mt-6 flex w-full max-w-[1200px] flex-col items-center justify-center px-4 text-white md:mx-auto md:mt-24 md:px-0">
      <h4 className="w-full text-base md:text-lg">Create new Surge accounts</h4>
      <div className="mt-4 flex w-full items-start justify-between rounded-3xl bg-[#121314] px-4 py-6 md:mt-8 md:items-center md:px-14">
        <button
          onClick={() => setStep(1)}
          className={[
            "flex flex-col items-center gap-y-2",
            step === 1 ? "text-electric-green" : "",
          ].join(" ")}
        >
          <InfoIcon className="size-6 md:size-8" />
          <span className="text-xs">Information</span>
        </button>
        <StepArrowIcon className="hidden md:inline-block" />
        <button
          onClick={() => (step === 1 ? nextStep() : setStep(2))}
          className={[
            "flex flex-col items-center gap-y-2",
            step === 2 ? "text-electric-green" : "",
          ].join(" ")}
        >
          <SignIcon className="size-6 md:size-8" />
          <span className="text-xs">Sign and confirm</span>
        </button>
        <StepArrowIcon className="hidden md:inline-block" />
        <button
          onClick={() => setStep(3)}
          className={[
            "flex flex-col items-center gap-y-2",
            step === 3 ? "text-electric-green" : "",
          ].join(" ")}
        >
          <ReviewIcon className="size-6 md:size-8" />
          <span className="text-xs">Review</span>
        </button>
      </div>
      {step === 1 && <Info nextStep={nextStep} setName={setName} />}
      {step === 2 && (
        <Sign
          preStep={preStep}
          nextStep={nextStep}
          signerNum={signerNum}
          publicKeys={publicKeys}
          setSignerNum={setSignerNum}
          setPublicKeys={setPublicKeys}
        />
      )}
      {step === 3 && (
        <Review
          name={name}
          preStep={preStep}
          signerNum={signerNum}
          publicKeys={publicKeys}
        />
      )}
    </div>
  )
}
