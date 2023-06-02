import ccxt from "ccxt";
import { sleep } from '../utils.js'

// 币安APi申请 https://www.binance.com/zh-CN/my/settings/api-management
// 注意：
// 1.币安api提币的风险是很大的，因为OK有提币白名单，如果出什么问题也是钱到了自己的地址；
// 2.币安只有IP的限制，同时提币也不能手动取消，建议新建一个币安的小号来专门用于API提币；
// 3.另外币安新号提币会有一些风控，可能会需要人脸验证，这个看你自己怎么解决了。
const binanceApiObj = {
  apiKey: "",
  secretKey: ""
}

const bian = new ccxt.binance({
  apiKey: binanceApiObj.apiKey,
  secret: binanceApiObj.secretKey,
})


async function getBinanceBalance () {
  const balances = await bian.fetchBalance()
  const coins = Object.keys(balances.total)
  for (let coin of coins) {
    if (!balances.total[coin]) {
      delete balances.total[coin]
    }
  }
  console.log(balances.total)
}

async function withDrawBinance (coin, network, address, amount, pwd = "") {
  const res = await bian.withdraw(coin, amount, address, undefined, {
    network
  })
  if (res.id) {
    console.log(`币安: 正在提现 ${network} 链的 ${amount} 个 ${coin} 到 ${address}，提现ID 为 ${res.id}`)
  }
}

async function withdrawBinanceBatch (params) {
  for (let param of params) {
    let [ coin, network, address, amount, pwd ] = param
    pwd = pwd || ""
    await withDrawBinance(coin, network, address, amount, pwd)
    await sleep(3, "进入币安提币间隔3s")
  }
}

async function main () {
  // 输出币安提币余额
  await getBinanceBalance()

  // 提币2例
  // await withDrawBinance("ETH", "ETH", "0xc8cd1567ACfABFCBeCc76776Cd92e0B95Fb3A806", 0.01)
  // await withDrawBinance("ARB", "ARBITRUM", "0xc8cd1567ACfABFCBeCc76776Cd92e0B95Fb3A806", 2)

  // 批量提币
  await withdrawBinanceBatch([
    // [ "ETH", "ARBITRUM", "0xc8cd1567ACfABFCBeCc76776Cd92e0B95Fb3A806", 0.01 ],
    // [ "ETH", "ETH", "0x50478A8872f04cDD7f4A6c03cB0b67fF09923AA4", 0.012 ],
    // [ "ETH", "ETH", "0x2c8500348BE5E03e02a13bE320D214190B6E4Ee7", 0.014 ],
  ])

}

main()