const express = require('express')
const router = express.Router()
const User = require('../models/User')
const Utils = require('../Utils')
let utils = new Utils()



async function getCookieUser(req) {
    let user = req.cookies['user'] ? JSON.parse(req.cookies['user']) : null
    if (!user) return null

    let { username, password } = user
    let userDb = await User.findOne({ username, password }).then(user => user).catch(error => null)

    if (!userDb) return null
    return userDb
}

router.get('/create', async (req, res) => {
    let userDB = await getCookieUser(req)
    if (!userDB) {
        res.redirect('/login')
    }
    // res.render('index', )
    let { username, role, email, isAdmin, name, password, _id } = userDB
    console.log(isAdmin)
    if (!isAdmin) {
        res.redirect('/')
    }

    res.render('create-account', { username, role, email, isAdmin, name, password, _id })
})



router.post('/create', (req, res) => {
    let user = { ...req.body }
    if (!user.admin) {
        user.admin = false
    } else {
        user.isAdmin = true
    }

    const newUser = new User(user);

    newUser.save().then(userSave => {
        console.log('Save success')

        res.redirect('/')
    })
        .catch(error => {
            console.log(`Save new user fail, ${error.message}`)
            res.redirect('/users/create')
        })
})

router.put('/:id', (req, res) => {
    let { id } = req.params
    let update = { ...req.body }
    User.findByIdAndUpdate(id, update, (error, result) => {
        if (error) {
            res.json({ message: error.message })
        }
        else {
            res.json(result)
        }
    })
})







module.exports = router