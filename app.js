const express = require('express')
const morgan = require('morgan')
const multer = require('multer')
const ip = require('ip')
var os = require('os')
var hostname = os.hostname()
const nodemailer = require('nodemailer')
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

var methodOverride = require('method-override')


const port = process.env.PORT || 3000

const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: 'sonvt666@gmail.com',
		pass: 'Sonvt666123#'
	}
})



const fileStorageEngine = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, './images')
	},
	filename: (req, file, cb) => {
		cb(null, Date.now() + '--' + file.originalname)
	}
})
const upload = multer({ storage: fileStorageEngine })

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
	// res.redirect(`/${uuidV4()}`)
	let user = req.cookies['user'] ? JSON.parse(req.cookies['user']) : null
	if (!user) return null

	let { username, password } = user
	let userDb = await User.findOne({ username, password }).then(user => user).catch(error => null)

	if (!userDb) return null
	return userDb
}

app.get('/', async (req, res) => {
	// res.redirect(`/${uuidV4()}`)
	let user = req.cookies['user'] ? JSON.parse(req.cookies['user']) : null
	if (!user) res.redirect('/dang-nhap')

	let { username, password } = user
	let userDb = await User.findOne({ username, password }).then(user => user).catch(error => null)

	if (!userDb) {
		res.redirect('/dang-nhap')
	}

	let { role, email, isAdmin, name, _id } = userDb
	res.render('index', { username, role, email, isAdmin, name, password, _id })


})


app.get('/dang-nhap', async (req, res) => {
	let user = req.cookies['user'] ? JSON.parse(req.cookies['user']) : null
	if (user) {
		let { username, password } = user
		let userDb = await User.findOne({ username, password }).then(user => user).catch(error => null)
		if (userDb) {
			res.redirect('back')
		}
	}

	res.render('login')

})


app.post('/dang-nhap', async (req, res) => {

	let { username, password } = req.body

	let userDb = await User.findOne({ username, password }).then(user => user).catch(error => null)
	if (userDb) {
		console.log('Found user!')
		console.log(userDb)
		// Set cookie
		res.redirect('set-cookie?username=' + username + '&password=' + password)

		// res.redirect(`set-cookie?username=${username}&password=${password}`)
		// res.render('index')

	} else {
		console.log(`Not found ${username}`)
		res.redirect('/dang-nhap')
	}
})

app.get('/set-cookie', (req, res) => {
	console.log('get- set - cookie')
	let { username, password } = req.query
	res.render('set-cookie', { username, password })
})


app.get('/tao-tai-khoan', async (req, res) => {
	let userDB = await getCookieUser(req)
	if (!userDB) {
		res.redirect('/dang-nhap')
	}
	// res.render('index', )
	let { username, role, email, isAdmin, name, password, _id } = userDB
	console.log(isAdmin)
	if (!isAdmin) {
		res.redirect('/')
	}

	res.render('create-account', { username, role, email, isAdmin, name, password, _id })
})



app.post('/tao-tai-khoan', (req, res) => {
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
			res.redirect('/tao-tai-khoan')
		})
})

app.get('/benh-an/:id', async (req, res) => {
	let userDB = await getCookieUser(req)
	if (!userDB) {
		res.redirect('/dang-nhap')
	}
	let id = req.params.id
	let patientDB = await Patient.findOne({ _id: id })
		.then(patient => {
			console.log(`Find patient ${id} successfully!`)
			return patient
		})
		.catch(error => {
			console.log(`Find patient ${id} fail: ${error.message}`)
			return null
		})

	if (patientDB) {

		let a = {

			'ma_benh_an': patientDB['id'],
			'benh-vien': patientDB['benh-vien'],
			'ten': patientDB['ten'],
			'tuoi': patientDB['tuoi'],
			'email': patientDB['email'],
			'gioi-tinh': patientDB['gioi-tinh'],
			'dan-toc': patientDB['dan-toc'],
			'dia-chi': patientDB['dia-chi'],
			'li-do-kham': patientDB['li-do-kham'],
			'qua-trinh-benh-li': patientDB['qua-trinh-benh-li'],
			'tien-su-benh': patientDB['tien-su-benh'],
			'kham-xet-toan-than': patientDB['kham-xet-toan-than'],
			'kham-xet-cac-bo-phan': patientDB['kham-xet-cac-bo-phan'],
			'tom-tat-ket-qua-lam-san': patientDB['tom-tat-ket-qua-lam-san'],
			'chan-doan-vao-vien': patientDB['chan-doan-vao-vien'],
			'thuoc': patientDB['thuoc'],
			'dieu-tri-tai-khoa': patientDB['dieu-tri-tai-khoa'],
			'chu-y': patientDB['chu-y'],
			'images': patientDB['images'],
			'doctors': patientDB['doctors'],
		}

		let { username, role, email, isAdmin, name } = userDB

		res.render('patient', { patient: a, username, role, email, isAdmin, name })
	} else {
		res.json({ message: "This patient is not exist!" })
	}

})



app.get('/tao-benh-an', async (req, res) => {
	let userDB = await getCookieUser(req)
	if (!userDB) {
		res.redirect('/dang-nhap')
	}
	// res.render('index', )
	let { username, role, email, isAdmin, name, _id } = userDB
	console.log(isAdmin)


	// Get all email bac si
	let doctorEmails = await User.find({ role: 'Bác sĩ' }).then(doctors => {
		return doctors.map(d => d.email)
	})
		.catch(error => console.log(error))

	res.render('create-patient', { username, role, email, isAdmin, name, doctorEmails, _id })
})


app.post('/tao-benh-an', upload.array('images'), (req, res) => {

	let imageURLs = []
	req.files.forEach(image => {
		let imageURL = `/image/${image.filename}`
		imageURLs.push(imageURL)
	})
	// console.log(imageURLs)
	let patient = { ...req.body }

	console.log(patient)


	patient.images = imageURLs
	let newPatient = new Patient(patient)

	newPatient.save()
		.then(patientDB => {
			console.log('Save patient successfully!')

			// Gui gmail
			if (patient.doctors) {
				let mailOptions = {
					from: 'sonvt666@gmail.com',
					to: patient.doctors.join(', '),
					subject: `Yêu cầu chẩn đoán cho bệnh nhân ${patient['ten']}, ${patient['li-do-kham']}`,
					text:
						`
				- Thời gian bắt đầu: ${patient['thoi-gian']}.
				- Bệnh nhân: ${patient['ten']}.
				- Lí do khám: ${patient['li-do-kham']}.
				- Quá trình bệnh lí: ${patient['qua-trinh-benh-li']}.
				- Link Đăng nhập vào trang chẩn đoán ${ip.address()}:${port}/dang-nhap rồi vào đường dẫn ${ip.address()}:${port}/benh-an/${patientDB._id} để xem chi tiết về bệnh án/bệnh nhân này.
				`
				}

				transporter.sendMail(mailOptions, (error, data) => {
					if (error) {
						console.log(error.message)
					} else {
						console.log('Send email successfully!')
					}
				})
			}




			res.redirect('/danh-sach-benh-an')
		}
		)
		.catch(error => {
			console.log(`Save patient fail: ${error.message}`)
			res.redirect('/tao-benh-an')
		})
})

app.get('/danh-sach-benh-an/:email', async (req, res) => {
	let userDB = await getCookieUser(req)
	if (!userDB) {
		res.redirect('/dang-nhap')
	}
	// res.render('index', )
	let { username, role, isAdmin, name } = userDB
	let email = req.params.email

	Patient.find({ email: email })
		.then(patients => {
			// console.log(patients)

			let filteredPatients = patients.map(p => {

				return {
					'thoi-gian': p['thoi-gian'],
					'ma_benh_an': p['id'],
					'benh-vien': p['benh-vien'],
					'ten': p['ten'],
					'tuoi': p['tuoi'],
					'email': p['email'],
					'gioi-tinh': p['gioi-tinh'],
					'dan-toc': p['dan-toc'],
					'dia-chi': p['dia-chi'],
					'li-do-kham': p['li-do-kham'],
					'qua-trinh-benh-li': p['qua-trinh-benh-li'],
					'tien-su-benh-ban-than': p['tien-su-benh-ban-than'],
					'kham-xet-toan-than': p['kham-xet-toan-than'],
					'kham-xet-cac-bo-phan': p['kham-xet-cac-bo-phan'],
					'tom-tat-ket-qua-lam-san': p['tom-tat-ket-qua-lam-san'],
					'chan-doan-vao-vien': p['chan-doan-vao-vien'],
					'thuoc': p['thuoc'],
					'dieu-tri-tai-khoa': p['dieu-tri-tai-khoa'],
					'chu-y': p['chu-y'],
					'thoi-gian': p['createdAt']
				}
			})

			res.render('patients', { patients: filteredPatients, username, role, email, isAdmin, name })
		})
		.catch(error => {
			console.log(`Get patient list failed: ${error.message}`)
		})
})




app.get('/danh-sach-benh-an', async (req, res) => {

	let userDB = await getCookieUser(req)
	if (!userDB) {
		res.redirect('/dang-nhap')
	}
	// res.render('index', )
	let { username, role, email, isAdmin, name } = userDB
	console.log(isAdmin)
	if (!isAdmin) {
		res.redirect('/')
	}

	Patient.find({})
		.then(patients => {
			// console.log(patients)

			let filteredPatients = patients.map(p => {

				return {
					'thoi-gian': p['thoi-gian'],
					'ma_benh_an': p['id'],
					'benh-vien': p['benh-vien'],
					'ten': p['ten'],
					'tuoi': p['tuoi'],
					'email': p['email'],
					'gioi-tinh': p['gioi-tinh'],
					'dan-toc': p['dan-toc'],
					'dia-chi': p['dia-chi'],
					'li-do-kham': p['li-do-kham'],
					'qua-trinh-benh-li': p['qua-trinh-benh-li'],
					'tien-su-benh-ban-than': p['tien-su-benh-ban-than'],
					'kham-xet-toan-than': p['kham-xet-toan-than'],
					'kham-xet-cac-bo-phan': p['kham-xet-cac-bo-phan'],
					'tom-tat-ket-qua-lam-san': p['tom-tat-ket-qua-lam-san'],
					'chan-doan-vao-vien': p['chan-doan-vao-vien'],
					'thuoc': p['thuoc'],
					'dieu-tri-tai-khoa': p['dieu-tri-tai-khoa'],
					'chu-y': p['chu-y'],
					'thoi-gian': p['createdAt']
				}
			})

			res.render('patients', { patients: filteredPatients, username, role, email, isAdmin, name })
		})
		.catch(error => {
			console.log(`Get patient list failed: ${error.message}`)
		})
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



app.put('/benh-an/:id', upload.array('images'), (req, res) => {
	// khong can phai gui mail
	let imageURLs = []
	req.files.forEach(image => {
		let imageURL = `/image/${image.filename}`
		imageURLs.push(imageURL)
	})

	let { id } = req.params
	let updates = { ...req.body }
	updates.images = imageURLs
	Patient.findByIdAndUpdate(id, updates, (error, result) => {
		if (error) {
			res.json({ message: error.message })
		} else {
			res.json(result)
		}
	})
})

app.get('/thong-tin-ca-nhan', async (req, res) => {
	let userDB = await getCookieUser(req)
	if (!userDB) {
		res.redirect('/dang-nhap')
	}
	// res.render('index', )
	let { username, role, email, isAdmin, name, password, _id } = userDB


	res.render('my-information', { username, email, role, name, password, isAdmin, _id })

})


app.put('/nguoi-dung/:id', (req, res) => {
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
app.get('/:room', (req, res) => {
	res.render('room', { roomId: req.params.room })
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