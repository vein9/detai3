const express = require('express')
const router = express.Router()
const Patient = require('../models/Patient')
const User = require('../models/User')
const Utils = require('../Utils')
let utils = new Utils()
const nodemailer = require('nodemailer')
const multer = require('multer')

// Upload images
const fileStorageEngine = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './images')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '--' + file.originalname)
    }
})

const upload = multer({ storage: fileStorageEngine })



// Node mailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'sonvt666@gmail.com',
        pass: 'Sonvt666123#'
    }
})

async function getCookieUser(req) {
    let user = req.cookies['user'] ? JSON.parse(req.cookies['user']) : null
    if (!user) return null

    let { username, password } = user
    let userDb = await User.findOne({ username, password }).then(user => user).catch(error => null)

    if (!userDb) return null
    return userDb
}




router.get('/', async (req, res) => {
    let userDB = await getCookieUser(req)
    if (!userDB) {
        res.redirect('/login')
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

router.get('/create', async (req, res) => {
    let userDB = await getCookieUser(req)
    if (!userDB) {
        res.redirect('/login')
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

router.get('/email/:email', async (req, res) => {
    let userDB = await getCookieUser(req)
    if (!userDB) {
        res.redirect('/login')
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





router.get('/id/:id', async (req, res) => {
    let userDB = await getCookieUser(req)
    if (!userDB) {
        res.redirect('/login')
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





router.post('/create', upload.array('images'), (req, res) => {

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
            //
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
							- Link Đăng nhập vào trang chẩn đoán http://localhost:3000/login rồi vào đường dẫn http://localhost:3000/patients/id/${patientDB._id} để xem chi tiết về bệnh án/bệnh nhân này.
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




            res.redirect('/patients')
        }
        )
        .catch(error => {
            console.log(`Save patient fail: ${error.message}`)
            res.redirect('/patients/create')
        })
})




router.put('/id/:id', (req, res) => {
    let { id } = req.params
    let updates = { ...req.body }
    Patient.findByIdAndUpdate(id, updates, (error, result) => {
        if (error) {
            res.json({ message: error.message })
        } else {
            res.json(result)
        }
    })
})










module.exports = router