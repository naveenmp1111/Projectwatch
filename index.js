const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/project_watch')


const express = require('express')
// const session = require('express-session')
const app = express()
// const path = require('path')
const userRoute = require('./routes/userRoute')
const adminRoute = require('./routes/adminRoute')
const multer = require('multer')
const nocache = require('nocache')
app.use(express.json())


app.use('/uploads', express.static('uploads'))
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/uploads'); // 'uploads/' is the destination folder for uploaded files
  },
  filename: function (req, file, cb) {
    // Define the file name for the uploaded file (you can customize this)
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });


app.use(express.urlencoded({ extended: true }))

app.set('view engine', 'ejs')

app.use(express.static('public'))

app.use(nocache())

app.use('/', userRoute)

app.use('/admin', adminRoute)


app.listen(7000, () => {
  console.log('http://localhost:7000')
})