// how to send a transaction using javascript
// 可以实现的功能，批量归集，发送16进制数据啊

import { JsonRpcProvider, Wallet, ethers } from "ethers"

async function sendTx(rpcUrl, privateKey, to, hexData = "0x", value = 0) {
  const tx = {
    to,
    value: ethers.parseEther(value.toString()),
    data: hexData
  }
  const provider = new ethers.JsonRpcProvider(rpcUrl)
  const signer = new ethers.Wallet(privateKey, provider)
  try {
    const txRes = await signer.sendTransaction(tx)
    const blockExplorer = "https://etherscan.io/tx/"
    // const blockExplorer = "https://goerli.etherscan.io/tx/"
    console.log(`${signer.address} 发送交易成功: ${blockExplorer}${txRes.hash}`) 
  } catch (error) {
    console.log(`${signer.address} 发送交易失败: ${error.reason || error.message || error}`)    
  }
}


async function sendEthi (privateKeys, rpcUrl) {
  const to = "0x0000000000000000000000000000000000000000"
  for (let i = 0; i < privateKeys.length; i++) {
    const wallet = new Wallet(privateKeys[i])
    const provider = new JsonRpcProvider(rpcUrl)
    const nonce = await provider.getTransactionCount(wallet.address)
    const data = `data:application/json,{"p":"terc-20","op":"mint","tick":"ethi","nonce":"${nonce}","amt":"1000"}`
    const hexData = "0x" + Buffer.from(data).toString("hex")
    await sendTx(rpcUrl, privateKeys[i], to, hexData)
  }
}

// 归集ETH（主网），不留余额
async function collectEth (privateKeys, to, rpc) {
  const provider = new ethers.JsonRpcProvider(rpc)
  const chain = await provider.getNetwork()
  if (chain.name !== "mainnet") {
    return console.log("请使用主网RPC") 
  }
  for (let i = 0; i < privateKeys.length; i++) {
    const signer = new ethers.Wallet(privateKeys[i], provider)
    const gasPrice_ = (await provider.getFeeData()).gasPrice
    // 在当前gasPrice的基础上加3gwei，保证不会因为gasPrice太低堵在链上
    const gasPrice = ethers.parseUnits(Math.ceil((ethers.formatUnits(gasPrice_.toString(), "gwei")) + 3).toString(), "gwei")
    const ethBalance = await provider.getBalance(signer.address)
    const gasFee = gasPrice * 21000n
    if (ethBalance < gasFee) {
      console.log(`${signer.address} 余额不足，无法发送交易`)
      continue
    }
    try {
      const tx = await signer.sendTransaction({
        to,
        value: ethBalance - gasFee,
        gasPrice,
      }) 
      console.log(`${signer.address} 发送交易成功: https://etherscan.io/tx/${tx.hash}`)
    } catch (error) {
      console.log(`${signer.address} 发送交易失败: ${error.reason || error.message || error}`)
    }
  }
}


async function main() {
  const rpcUrlMainnet = "https://eth-mainnet.g.alchemy.com/v2/jgaGmIRKUUjE_yF8WYfjYribSg4QtPlF"
  const privateKeys = [
    ""
  ]
  sendEthi(privateKeys, rpcUrlMainnet)
}

main()
