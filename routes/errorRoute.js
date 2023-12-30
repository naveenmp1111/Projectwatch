const express=require('express')
const errorRoute=express()
const session=require('express-session')
const path=require('path')
const multer=require('multer')
const upload=multer({dest:'uploads/'})
const Product = require('../models/productModel')
const auth=require('../middlewares/adminAuth')
const uuid = require('uuid');
const sessionSecret = uuid.v4();
  

errorRoute.set('view engine','ejs')
errorRoute.set('views','./views/error')

errorRoute.get()