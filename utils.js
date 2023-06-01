// 倒计时函数
export async function sleep(time, str, after) {
	if (str) console.log(str)
	return new Promise((resolve) => {
		let i = time
		console.log(`倒计时 ${i} 秒...`)
		const timer = setInterval(() => {
			i--
			console.log(`倒计时 ${i} 秒...`)
			if (i === 0) {
				clearInterval(timer)
				resolve(1)
				if (after) {
					console.log(after)
				}
			}
		}, 1000)
	}
	)
}