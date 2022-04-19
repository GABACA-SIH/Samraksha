const mongoose = require('mongoose')

const Users = new mongoose.Schema(
	{
		username: { type: String, required: true },
		password: { type: String, required: true },
        usertype: { type: String, required: true }
	},
	{ collection: 'users' }
)

const model = mongoose.model('UserData', Users)

module.exports = model