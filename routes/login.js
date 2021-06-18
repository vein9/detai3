const express = require('express')
const router = express.Router()
const User = require('../models/User')
const Utils = require('../Utils')
let utils = new Utils()

router.get('/', async (req, res, next) => {
    let user = req.cookies['user'] ? JSON.parse(req.cookies['user']) : null
    if (user) {
        let { username, password } = user
        let userDb = await User.findOne({ username, password })
            .then(user => user)
            .catch(error => null)

        if (userDb) {
            res.redirect('back')
        }
    }

    res.render('login')

})


router.post('/', async (req, res, next) => {
    let { username, password } = req.body
    let userDb = await User.findOne({ username, password })
        .then(user => user)
        .catch(error => null)

    if (userDb) {
        console.log('Found user!')
        // Set cookie
        res.redirect('set-cookie?username=' + username + '&password=' + password)
    } else {
        console.log(`Not found ${username}`)
        res.redirect('/login')
    }
})





module.exports = router