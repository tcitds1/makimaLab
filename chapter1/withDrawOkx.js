import ccxt from "ccxt"
import { sleep } from '../utils.js'

// 1. 申请okx api https://www.okx.com/cn/account/my-api
// 2. 开启提币白名单
// 3. 把需要提币的地址加入白名单

const okxApiObj = {
	secretkey: "",
	apikey: "",
	password: ""
}

const okx = new ccxt.okex({
	'apiKey': okxApiObj.apikey,
	'secret': okxApiObj.secretkey,
	'password': okxApiObj.password
})

// 获取okx余额
async function getOkxBalance (type = "funding") {
	const balances = await okx.fetchBalance({
		type
	})
	console.log(balances.total)
}

// okx提现
// coin: "USDT" | "USDC" | "BTC" | "ETH" ...
// network: "ERC20" | "Arbitrum one" | "zkSync Era" | "TRC20" ...
// address: "0x1De15E60e935B483d1067b67e42cCE28bB7750b1"
// amount: "2"
async function withDrawOkx(coin, network, address, amount, pwd = "") {
	const currencies = await okx.fetchCurrencies()
	const currency = currencies[coin]
	const fee = currency.networks[network].fee
	const res = await okx.withdraw(coin, amount, address, undefined, {
		network, fee, pwd: ""
	})
	if (res.info.wdId)  {
		console.log(`正在提现 ${network} 链的 ${amount} 个 ${coin} 到 ${address}，手续费 ${fee} ${coin}，提现流水号 为 ${res.info.wdId}`)
	}
}

async function withdrawOkxBatch (params) {
	for (let param of params) {
		let [ coin, network, address, amount, pwd ] = param
		pwd = pwd || ""
		await withDrawOkx(coin, network, address, amount, pwd)
		await sleep(3, "进入提币间隔3s")
	}
}

async function main() {
	// 获取okx余额
	await getOkxBalance()

	// 提现 2 个 USDT 到 ERC20 链
	// await withDrawOkx("USDT", "ERC20", "0x593bf5e65305325C190F9e428350697536c78ebd", "5")

	// 批量提现
	await withdrawOkxBatch([
		// ["USDT", "ERC20", "0x1De15E60e935B483d1067b67e42cCE28bB7750b1", "5"],
		// ["USDT", "ERC20", "0x3C670447dD49fD96E2039F584F8B738A1A7529e0", "5"],
		// ["ETH", "ERC20", "0x2c8500348BE5E03e02a13bE320D214190B6E4Ee7", "0.01"],
		// ["ETH", "Arbitrum one", "0x50478A8872f04cDD7f4A6c03cB0b67fF09923AA4", "0.005"],
	])

}

main()






