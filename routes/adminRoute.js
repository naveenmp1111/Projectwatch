const express=require('express')
const adminRoute=express()
const session=require('express-session')
const path=require('path')
const multer=require('multer')
const upload=multer({dest:'uploads/'})
const Product = require('../models/productModel')
const auth=require('../middlewares/adminAuth')
const uuid = require('uuid');
const sessionSecret = uuid.v4();
  

adminRoute.set('view engine','ejs')
adminRoute.set('views','./views/admin')

adminRoute.use(session({
    secret:sessionSecret,
    resave:false,
    saveUninitialized:true
}))

const adminController=require('../controllers/adminController')


adminRoute.get('/',auth.isLogout,adminController.loadLogin)
adminRoute.post('/',auth.isLogout,adminController.verifyLogin)
adminRoute.get('/home',auth.isLogin,adminController.loadDashboard)
adminRoute.get('/usersList',auth.isLogin,adminController.usersList)
adminRoute.get('/blockUser',auth.isLogin,adminController.blockUser)
adminRoute.get('/unblockUser',auth.isLogin,adminController.unblockUser)
adminRoute.get('/addProduct',auth.isLogin,adminController.loadAddProduct)
adminRoute.post('/addProduct',auth.isLogin,upload.array('image',5),adminController.addNewProduct)
adminRoute.get('/category',auth.isLogin,adminController.loadCategories)
adminRoute.post('/category',auth.isLogin,adminController.checkUniqueCategory,adminController.addCategories)
adminRoute.get('/blockCategory',auth.isLogin,adminController.blockCategory)
adminRoute.get('/unblockCategory',auth.isLogin,adminController.unBlockCategory)
adminRoute.get('/editCategory',auth.isLogin,adminController.editCategory)
adminRoute.post('/editCategory',auth.isLogin,adminController.checkUniqueCategory,adminController.loadEditCategory)
adminRoute.get('/deleteCategory',auth.isLogin,adminController.deleteCategory)
adminRoute.get('/productsList',auth.isLogin,adminController.productsList)
adminRoute.get('/editProductList',auth.isLogin,upload.array('image',5),adminController.editProductList)
adminRoute.post('/editProductList',auth.isLogin,upload.array('image',5),adminController.loadEditProductList)
adminRoute.get('/blockProductList',auth.isLogin,adminController.blockProductList)
adminRoute.get('/unBlockProductList',auth.isLogin,adminController.unBlockProductList)
adminRoute.get('/ordersList',auth.isLogin,adminController.ordersList)
adminRoute.get('/orderDetails',auth.isLogin,adminController.orderDetails)
adminRoute.post('/updateOrderStatus',auth.isLogin,adminController.updateOrderStatus)  
adminRoute.delete('/deleteImage/:productId/:index',auth.isLogin,adminController.deleteImage)
adminRoute.get('/salesReport',adminController.salesReport)
adminRoute.post('/dateFilter',adminController.dateFilter)
adminRoute.get('/brand',auth.isLogin,adminController.loadBrands)
adminRoute.post('/brand',auth.isLogin,adminController.checkUniqueBrand, upload.array('image',5),adminController.addBrand)
adminRoute.get('/blockBrand',auth.isLogin,adminController.blockBrand)
adminRoute.get('/unblockBrand',auth.isLogin,adminController.unBlockBrand)
adminRoute.get('/editBrand',auth.isLogin,adminController.editBrand)
adminRoute.post('/editBrand',upload.array('image',5),auth.isLogin,adminController.loadEditBrand)
adminRoute.get('/deleteBrand',auth.isLogin,adminController.deleteBrand)
adminRoute.get('/banner',adminController.bannerPage)
adminRoute.post('/addBanner',upload.array('image',5),adminController.addBanner)
adminRoute.post('/editBanner',upload.array('image',5),adminController.editBanner)
adminRoute.get('/blockBanner',adminController.blockBanner)
adminRoute.get('/unblockBanner',adminController.unblockBanner)
adminRoute.get('/logout',auth.isLogin,adminController.logout)

const offerController=require('../controllers/offerController')
adminRoute.get('/categoryOffer',offerController.categoryOffer)
adminRoute.get('/addCategoryOffer',offerController.addCategoryOffer)
adminRoute.post('/addCategoryOffer',offerController.updateCategoryOffer)
adminRoute.get('/deleteCategoryOffer',offerController.deleteCategoryOffer)

const couponController=require('../controllers/couponController')
adminRoute.get('/coupon',couponController.loadCouponPage)
adminRoute.post('/addCoupon',couponController.addCoupon)
adminRoute.get('/blockCoupon',couponController.blockCoupon)
adminRoute.get('/unblockCoupon',couponController.unblockCoupon)





module.exports=adminRoute