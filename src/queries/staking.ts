const BABYLON_PUBLIC_API_URL = process.env.BABYLON_PUBLIC_API_URL || 'https://staking-api.testnet.babylonchain.io';

export const getFinalityProviders = async (): Promise<any> => {
    const response = await fetch(`${BABYLON_PUBLIC_API_URL}/v1/finality-providers`);
    return response.json();
};