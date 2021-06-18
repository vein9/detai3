const express = require('express')
const morgan = require('morgan')

const ip = require('ip')
var os = require('os')
var hostname = os.hostname()
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser")
const mongoose = require('mongoose')
const User = require('./models/User')
const Patient = require('./models/Patient')
const fs = require('fs')
// Routers
const loginRouter = require('./routes/login')
const patientRouter = require('./routes/patient')
const userRouter = require('./routes/user')

var methodOverride = require('method-override')


const port = process.env.PORT || 3000

// Connect db
async function connectMongodb() {
	console.log('Connecting to Mongodb...')
	let dbName = 'detai3'
	const MONGODB_URL = `mongodb+srv://admin:admin@cluster0.q1n0h.mongodb.net/${dbName}?retryWrites=true&w=majority`
	let options = {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useCreateIndex: true,
	}
	try {
		await mongoose.connect(MONGODB_URL, options)
		console.log('Connect Mongodb successfully')
	} catch (error) {
		console.log(error.message)
		console.log('Connect Mongodb fail');
	}
}


async function getCookieUser(req) {
	let user = req.cookies['user'] ? JSON.parse(req.cookies['user']) : null
	if (!user) return null

	let { username, password } = user
	let userDb = await User.findOne({ username, password }).then(user => user).catch(error => null)

	if (!userDb) return null
	return userDb
}




app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: false }));//Parse application/xxx-www-url form encoded
app.use(bodyParser.json()); //parse application/json
app.use(methodOverride('_method'))
app.use(express.static('public'))
app.use(cookieParser())

app.use(express.json())
app.use(
	express.urlencoded({
		extended: true,
	}),
)

app.use(morgan('dev'))
// Use routers
app.use('/login', loginRouter)
app.use('/patients', patientRouter)
app.use('/users', userRouter)





app.get('/', async (req, res) => {
	// res.redirect(`/${uuidV4()}`)
	let user = req.cookies['user'] ? JSON.parse(req.cookies['user']) : null
	if (!user) res.redirect('/login')

	let { username, password } = user
	let userDb = await User.findOne({ username, password }).then(user => user).catch(error => null)

	if (!userDb) {
		res.redirect('/login')
	}

	let { role, email, isAdmin, name, _id } = userDb
	res.render('index', { username, role, email, isAdmin, name, password, _id })


})

app.get('/set-cookie', (req, res) => {
	console.log('get- set - cookie')
	let { username, password } = req.query
	res.render('set-cookie', { username, password })
})


app.get('/image/:name', (req, res) => {

	let imageName = 'images/' + req.params.name;
	fs.readFile(imageName, (error, imageData) => {
		if (error) {
			res.json({
				result: 'failed',
				message: `${error.message}`
			})
		}

		res.writeHead(200, { 'Content-Type': 'image/jpeg' })
		res.end(imageData)
	})
})





app.get('/thong-tin-ca-nhan', async (req, res) => {
	let userDB = await getCookieUser(req)
	if (!userDB) {
		res.redirect('/login')
	}
	// res.render('index', )
	let { username, role, email, isAdmin, name, password, _id } = userDB


	res.render('my-information', { username, email, role, name, password, isAdmin, _id })

})


io.on('connection', socket => {
	socket.on('join-room', (roomId, userId, name) => {
		socket.join(roomId)
		socket.to(roomId).broadcast.emit('user-connected', userId, name)

		socket.on('disconnect', () => {
			socket.to(roomId).broadcast.emit('user-disconnected', userId, name)
		})
	})
})

server.listen(port, async () => {
	console.log(`Listening ${port}`)
	await connectMongodb()
})