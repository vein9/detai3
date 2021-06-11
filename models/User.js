const mongoose = require('mongoose')
const Schema = mongoose.Schema

const User = new Schema(
    {
        name: String,
        email: String,
        username: String,
        password: String,
        isAdmin: { type: Boolean, default: false },
        role: String,
    },
    {
        timestamps: true,
    }
)

module.exports = mongoose.model('User', User)