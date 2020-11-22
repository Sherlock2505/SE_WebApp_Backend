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
	console.log(expertDetails)

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
	console.log(userDetails)

	const { language, chatType } = expertDetails

	const chat = `${language}${chatType}`

	const expertList = experts[chat]
	
	const expert = expertList.splice(Math.floor(Math.random()*expertList.length), 1)

	expert['socket'].emit("userConnected", userDetails)

	socket.emit("expertConnected", expert)

	socket.on('disconnect', () => {
		console.log("user disconnected...")
		expert[chat].push(expert)
	})
}

module.exports = {
	onConnection,
	onExpertConnection
}