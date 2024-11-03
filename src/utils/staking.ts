import * as ecc from "@bitcoin-js/tiny-secp256k1-asmjs";
import * as bitcoin from "bitcoinjs-lib";
import ECPairFactory from "ecpair";
import { API_TARGET } from "meta-contract";
bitcoin.initEccLib(ecc);
const ECPair = ECPairFactory(ecc);
const   generateRandomKeyPair = () => {
    const keyPair = ECPair.makeRandom({ network: bitcoin.networks.testnet });
    const { privateKey, publicKey } = keyPair;
    if (!privateKey || !publicKey) {
      throw new Error("Failed to generate random key pair");
    }
    const pk = publicKey.toString("hex");

    return {
      privateKey: privateKey.toString("hex"),
      publicKey: pk,
      publicKeyNoCoord: pk.slice(2),
      keyPair,
    };
  };
const  getRandomIntegerBetween = (min: number, max: number): number => {
    if (min > max) {
      throw new Error(
        "The minimum number should be less than or equal to the maximum number.",
      );
    }
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };
const generateMockStakingScripts = (publicKeyNoCoord:string): StakingScripts => {
   
    const finalityProviderPk = generateRandomKeyPair().publicKeyNoCoord;
    const committeeSize = getRandomIntegerBetween(1, 10);
    const globalParams = this.generateRandomObservableStakingParams(
      false,
      committeeSize,
    );
    const stakingTxTimelock = this.generateRandomTimelock(globalParams);

    // Convert covenant PKs to buffers
    const covenantPKsBuffer = globalParams.covenantNoCoordPks.map((pk: string) =>
      Buffer.from(pk, "hex"),
    );

    // Create staking script data
    let stakingScriptData;
    try {
      stakingScriptData = new StakingScriptData(
        Buffer.from(publicKeyNoCoord, "hex"),
        [Buffer.from(finalityProviderPk, "hex")],
        covenantPKsBuffer,
        globalParams.covenantQuorum,
        stakingTxTimelock,
        globalParams.unbondingTime,
        Buffer.from(globalParams.tag, "hex"),
      );
    } catch (error: any) {
      throw new Error(error?.message || "Cannot build staking script data");
    }

    // Build scripts
    let scripts;
    try {
      scripts = stakingScriptData.buildScripts();
    } catch (error: Error | any) {
      throw new Error(error?.message || "Error while recreating scripts");
    }

    return scripts;
  };