const experts = {
	englishtext: [],
	englishvoice: [],
	hinditext: [],
	hindivoice: []
}

const onConnection = socket => {
	console.log("trying to connect...")
	// console.log(socket)
}

const onExpertConnection = socket => {
	const expertDetails = socket.handshake.query
	console.log("expert", expertDetails)

	const { language, chatType } = expertDetails

	console.log(language, chatType)

	experts[`${language}${chatType}`].push({...expertDetails, socket: socket})

	socket.on('disconnect', () => {
		console.log("expert disconnected")

		experts[`${language}${chatType}`] = experts[`${language}${chatType}`].filter(ele => {
			return ele.expertId !== expertDetails.expertId
		})
	})
}

const onUserConnection = socket => {
	const userDetails = socket.handshake.query
	console.log("user", userDetails)

	const { language, chatType } = userDetails

	const chat = `${language}${chatType}`

	const expertList = experts[chat]
	
	const expert = expertList.splice(Math.floor(Math.random()*expertList.length), 1)[0]

	// console.log(expert)

	expert['socket'].emit("userConnected", userDetails)

	let expertData = {...expert}
	delete expertData['socket']

	socket.emit("expertConnected", expertData)

	socket.on('disconnect', () => {
		console.log("user disconnected...")
		expert[chat].push(expert)
	})
}

module.exports = {
	onConnection,
	onExpertConnection,
	onUserConnection
}