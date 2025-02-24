// 新增本地存储键名常量
const ACCOUNTS_KEY = 'surge-accounts';

export interface Account {
  id: string
  multiAddress: string // multi-sig address
  name: string
  num: number // number of required signatures
  pubKeys: string[] // public keys
  timestamp: string
}

export const getAccounts = (): Account[] => {
  // 从localStorage获取数据
  const data = localStorage.getItem(ACCOUNTS_KEY);
  return data ? JSON.parse(data) : [];
};

export const addAccount = async (
  multiAddress: string,
  name: string,
  pubKeys: string[],
  num: number,
): Promise<Account> => {
  const accounts = getAccounts();
  const newAccount: Account = {
    id: Date.now().toString(), // 生成唯一ID
    multiAddress,
    num,
    name,
    pubKeys,
    timestamp: Date.now().toString()
  };
  accounts.push(newAccount);
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  return newAccount;
};

export const findAccount = async (multiAddress: string): Promise<boolean> => {
  console.log("multiAddress", multiAddress)
  const accounts = getAccounts();
  console.log("accounts", accounts);
  return accounts.some((acc) => acc.multiAddress === multiAddress);
};

export const getAccountList = (pubKey: string): Account[] => {
  const accounts = getAccounts();
  return accounts.filter((acc) => 
    acc.pubKeys?.includes(pubKey)
  );
};
