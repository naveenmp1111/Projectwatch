require('dotenv').config();
const mongoose = require('mongoose')
mongoose.connect(process.env.MONGODB_URI)

const express = require('express')
const app = express()
const userRoute = require('./routes/userRoute')
const adminRoute = require('./routes/adminRoute')
const multer = require('multer')
const nocache = require('nocache');
const errorController = require('./controllers/errorController');
const cron= require('./other/cron') 
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

app.use('*',async(req,res)=>{

 res.render('user/404page')
})


const PORT = process.env.PORT || 7000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});