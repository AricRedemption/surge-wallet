// shouldDisplayTestingMsg function is used to check if the application is running in testing mode or not.
// Default to true if the environment variable is not set.
export const shouldDisplayTestingMsg = (): boolean => {
  return (
    import.meta.env.VITE_PUBLIC_DISPLAY_TESTING_MESSAGES?.toString() !== "false"
  );
};

// getNetworkAppUrl function is used to get the network app url based on the environment
export const getNetworkAppUrl = (): string => {
  return shouldDisplayTestingMsg()
    ? "https://btcstaking.testnet.babylonchain.io"
    : "https://btcstaking.babylonlabs.io";
};

// shouldDisplayPoints function is used to check if the application should
// display points or not based on the existence of the environment variable.
export const shouldDisplayPoints = (): boolean => {
  return !!import.meta.env.VITE_PUBLIC_POINTS_API_URL;
};

export const network = import.meta.env.VITE_NETWORK||'mainnet'
export const IS_DEV = import.meta.env.MODE === "development"
export const GAS_BUDGET = import.meta.env.VITE_GAS_BUDGET
