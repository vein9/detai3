const User = require('./models/User')
class Utils {
    constructor() {

    }

    async findOneUser(options) {
        // options is a object, ex: {username, password}
        let userFound = await User.findOne(options)
            .then(user => user)
            .catch(error => null)
        return userFound

    }


}


module.exports = Utils