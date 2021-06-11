const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Patient = new Schema(
    {
        'benh-vien': String,
        'thoi-gian': String,
        'ten': String,
        'email': String,
        'tuoi': String,
        'gioi-tinh': String,
        'dan-toc': String,
        'dia-chi': String,
        'li-do-kham': String,
        'qua-trinh-benh-li': String,
        'tien-su-benh': String,
        'kham-xet-toan-than': String,
        'kham-xet-cac-bo-phan': String,
        'tom-tat-ket-qua-lam-san': String,
        'chan-doan-vao-vien': String,
        'thuoc': String,
        'dieu-tri-tai-khoa': String,
        'chu-y': String,
        'images': [{ type: String }],
        'doctors': [{ type: String }]
    },
    {
        timestamps: true,
    }
)

module.exports = mongoose.model('Patient', Patient)