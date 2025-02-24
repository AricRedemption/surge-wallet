const TXS_KEY = "surge-transactions"

export interface Tx {
  id: string
  multiAddress: string
  lastPsbt: string
  currentPsbt: string
  pubKeys: Array<string>
  timestamp: string
  txId: string
  needToSign: string
}

export const generateRandomString = (length: number = 32) => {
  let randomString = ""
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

  for (let i = 0; i < length; i++) {
    randomString += characters.charAt(
      Math.floor(Math.random() * characters.length),
    )
  }

  return randomString
}

const getTransactions = (): Tx[] => {
  const data = localStorage.getItem(TXS_KEY)
  return data ? JSON.parse(data) : []
}

export const getOrder = (id: string) => {
  const txs = getTransactions()
  const order = txs.filter((tx) => tx.id === id)
  return order
}

export const getTxList = (multiAddress: string) => {
  const txs = getTransactions()
  return txs.filter((tx) => tx.multiAddress === multiAddress)
}

export const addTx = (
  multiAddress: string,
  psbtHex: string,
  pubKeys: Array<string>,
  needToSign: string,
) => {
  const txs = getTransactions()
  const newTx = {
    id: generateRandomString(16),
    multiAddress,
    lastPsbt: psbtHex,
    currentPsbt: psbtHex,
    pubKeys,
    timestamp: Date.now().toString(),
    txId: "",
    needToSign,
  }
  txs.push(newTx)
  localStorage.setItem(TXS_KEY, JSON.stringify(txs))
  return newTx
}

export const updateTx = (id: string, psbtHex: string, pubKey: string) => {
  const txs = getTransactions()
  const updated = txs.map((tx) => {
    if (tx.id === id) {
      return {
        ...tx,
        currentPsbt: psbtHex,
        lastPsbt: tx.currentPsbt,
        pubKeys: [...tx.pubKeys, pubKey],
      }
    }
    return tx
  })
  localStorage.setItem(TXS_KEY, JSON.stringify(updated))
}

export const overTx = (objectId: string, txid: string) => {
  const txs = getTransactions()
  const updated = txs.map((tx) => {
    if (tx.id === objectId) {
      return {
        ...tx,
        txId: txid,
      }
    }
    return tx
  })
  localStorage.setItem(TXS_KEY, JSON.stringify(updated))
}
