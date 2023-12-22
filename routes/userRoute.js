const express = require('express')
const userRoute = express()
const session = require('express-session')
const path = require('path')
const auth = require('../middlewares/userAuth')
const uuid = require('uuid');
const sessionSecret = uuid.v4();
userRoute.set('view engine', 'ejs')
userRoute.set('views', './views/user')

userRoute.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true
}))

const userController = require('../controllers/userController')

userRoute.get('/', userController.loadHome)
userRoute.get('/login', auth.isLogout, userController.loginLoad)
userRoute.get('/register', auth.isLogout, userController.loadRegister)
userRoute.get('/checkReferral', userController.checkReferral)
userRoute.post('/register', auth.isLogout, userController.checkUniqueEmail, userController.insertUser)
userRoute.get('/verifyOtp', auth.isLogout, userController.sendOtp)
userRoute.post('/verifyOtp', auth.isLogout, userController.verifyOtp)
userRoute.post('/home', auth.isLogout, auth.isBlocked, userController.verifyLogin)
userRoute.get('/forgotPassword', auth.isLogout, userController.forgotPassword)
userRoute.post('/forgotPassword', auth.isLogout, userController.getPasswordOtp)
userRoute.get('/generatePasswordOtp', userController.generatePasswordOtp)
userRoute.post('/passwordOtp', auth.isLogout, userController.verifypasswordotp)
userRoute.post('/resetPassword', auth.isLogout, userController.resetPassword)
userRoute.get('/productDetails', userController.productDetails)
userRoute.post('/productDetails', auth.isLogin, userController.addToCart)
userRoute.get('/userAccount', auth.isBlocked, auth.isLogin, userController.userAccount)
userRoute.get('/addressForm', auth.isLogin, userController.addressForm)
userRoute.post('/addressForm', auth.isLogin, userController.addAddress)
userRoute.get('/cart', auth.isBlocked, auth.isLogin, userController.showCart)
userRoute.get('/deleteFromCart', auth.isLogin, userController.deleteFromCart)
userRoute.get('/checkout', auth.isBlocked, auth.isLogin, userController.showCheckOut)
userRoute.get('/applyCoupon', userController.applyCoupon)
userRoute.get('/editAddressForm', auth.isLogin, userController.editAddressForm)
userRoute.post('/editAddressForm', auth.isLogin, userController.updateAddress)
userRoute.post('/updateQuantity/:newQuantity/:index', auth.isLogin, userController.updateQuantity)
userRoute.post('/updateUserDetails', auth.isLogin, userController.checkUniqueEmail2, userController.updateUserDetails)
userRoute.post('/updatePassword', auth.isBlocked, auth.isLogin, userController.updatePassword)
userRoute.get('/logout', auth.isLogin, userController.logout)

//-----------------------------------------------shopController----------------------------------------->
const shopController = require('../controllers/shopController')
userRoute.get('/shop', shopController.showShop)
userRoute.get('/homeSort', shopController.homeSort)
userRoute.get('/homeDeepSort', shopController.homeDeepSort)


//-----------------------------------------------ordercontroller---------------------------------------->

const orderController = require('../controllers/orderController')
userRoute.post('/placeOrder', auth.isBlocked, orderController.placeOrder)
userRoute.get('/orderDetails', orderController.orderDetails)
userRoute.get('/cancelOrder', orderController.cancelOrder)
userRoute.get('/returnOrder', orderController.returnOrder)
userRoute.post('/onlinepayment', orderController.onlinePayment)
userRoute.get('/onlinepayment', orderController.paymentSuccess)
userRoute.get('/checkWallet', orderController.checkWallet)
userRoute.get('/walletpayment', orderController.walletPayment)



//----------------------------------------------wishlist------------------------------------------------>

const wishlistController = require('../controllers/wishlistController')
userRoute.get('/addToWishlist', auth.isBlocked, wishlistController.addToWishlist)
userRoute.get('/wishlist', auth.isBlocked, wishlistController.showWishlist)
userRoute.get('/addToCart', auth.isBlocked, wishlistController.addToCart)
userRoute.get('/deleteFromWishlist', wishlistController.deleteFromWishlist)



module.exports = userRoute