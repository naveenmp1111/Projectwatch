const User = require('../models/userModel')
const Product = require('../models/productModel')
const nodemailer = require('nodemailer')
const Order = require('../models/orderModel')
const Category=require('../models/categoryModel')
const Brand =require('../models/brandModel')
const Coupon=require('../models/couponModel')
const Wishlist=require('../models/wishlistModel')
const userAuth = require('../middlewares/userAuth')
const { ConversationListInstance } = require('twilio/lib/rest/conversations/v1/conversation')
const { json } = require('express')


const loadHome = async (req, res) => {
    try {
        // const testData=await User.findOne({email:'fffa@gmail.com'})
        // console.log(testData)
        // const updateDocuments = await Product.updateMany(
        //     {},
        //     {
        //       $rename: {
        //          'catOfferStatus':'catStatus'
        //       }
        //     }
        //   );
        //   console.log(updateDocuments)
          

        const email = req.session.email
        const userData = await User.findOne({ email: email })
        const categoryData=await Category.find({is_active:true})
        const brandData=await Brand.find({is_active:true})
        const productData = await Product.find({ 
            is_active: true,
            catStatus:true
         }).populate('brandId').populate('categoryId').sort({date:-1}).limit(9)

        // const res=productData.sort({salePrice:-1})
        // console.log(res)
         if (userData) {
            if (userData.is_active == false) {
                res.render('login', { message: 'User is blocked' })
            } else {
                res.render('home', { products: productData, user: userData,categories:categoryData,brands:brandData })
            }
        } else {
            res.render('home', { products: productData, user: userData ,categories:categoryData,brands:brandData})
        }

    } catch (error) {
        console.log(error.message)
    }
}

const loginLoad = async (req, res) => {
    try {
        res.render('login', { message: '' })
    } catch (error) {
        console.log(error.message)
    }
}

const loadRegister = async (req, res) => {
    try {
        res.render('registration', { message: '' })
    } catch (error) {
        console.log(error.message)
    }
}

const insertUser = async (req, res) => {
    try {
        if(req.body.password == req.body.confirmPassword){
        const obj = {
            name: req.body.name,
            email: req.body.email,
            mobile: req.body.mobile,
            password: req.body.password
        }

        req.session.data = obj
        if (obj.name) {
            res.redirect('/verifyOtp')
        } else {
            res.write('fill all fields')
        }
    }

    } catch (error) {
        console.log(error.message)
    }
}

const sendOtp = async (req, res) => {
    // req.session.otpIsVerified = true
    try {
        const randomotp = Math.floor(1000 + Math.random() * 9000);
        console.log(randomotp)
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'naveenapk048@gmail.com',
                pass: 'ujdt ygiw aozy lgsv'
            }
        });


        const mailOptions = {
            from: 'naveenapk048@gmail.com',
            to: 'apkcity369@gmail.com',
            subject: 'Hello, Nodemailer!',
            text: `Your verification OTP is ${randomotp}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Error sending email: ' + error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

        req.session.otp = randomotp
        // console.log(req.session.otpIsVerified)
        console.log(req.session.otp)
        setTimeout(() => {
            // req.session.otpIsVerified = false
            // delete req.session.otpIsVerified
            console.log('session ended')
            // console.log(req.session.otpIsVerified)
        }, 30000);


        // console.log(req.session.data)

        // const name = req.query.name
        // const email = req.query.email
        // const mobile = req.query.mobile
        // const password = req.query.password

        // res.render('otpverification', { name, email, mobile, password, randomotp, message: '' })


        req.session.otpTime=Date.now()

        res.render('otpverification', { message: '' })
        // res.render('otpverification', { message: '' })

    } catch (error) {
        console.log(error.message)
    }
}

const verifyOtp = async (req, res) => {
    try {
        const otp = req.session.otp
        const randomotp = req.body.otp
        const timelimit=Date.now()

        if(timelimit - req.session.otpTime > 30000){
            res.render('otpverification', { message: 'OTP timeout' })
        }else{
            const { name, email, mobile, password } = req.session.data
            console.log(req.session.otpIsVerified);
            // if (req.session.otpIsVerified) {
                if (randomotp == otp) {
    

                    async function generateReferralCode() {
                        const length = 8;
                        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
                      
                        let referralCode;
                        let isUnique = false;
                      
                        while (!isUnique) {
                          referralCode = '';
                      
                          for (let i = 0; i < length; i++) {
                            const randomIndex = Math.floor(Math.random() * characters.length);
                            referralCode += characters.charAt(randomIndex);
                          }
                      
                          const userData = await User.findOne({ referralCode: referralCode });
                      
                          if (!userData) {
                            isUnique = true;
                          }
                        }
                      
                        return referralCode;
                      }
                      
                      
                      const myReferralCode = generateReferralCode();
                      
                      


                    const user = new User({
                        name: name,
                        email: email,
                        mobile: mobile,
                        password: password,
                        is_admin: 0,
                        referralCode:myReferralCode
                    })
                    await user.save()
                    res.redirect('/login')
                } else {
                    res.render('otpverification', { message: 'Invalid Otp' })
                }
            // } else {
            //     res.render('otpverification', { message: 'OTP timeout' })
            // }
        }
       

    } catch (error) {
        console.log(error.message)
    }
}

const verifyLogin = async (req, res) => {
    try {
        const email = req.body.email

        const password = req.body.password
        const userData = await User.findOne({ email: email })
        const productData = await Product.find({  is_active: true,catStatus:true })
        // console.log(productData)
        // console.log(userData.address[0].fname);
        if (userData) {
            if (userData.is_active) {
                if (userData.password === password) {
                    req.session.email = email
                    res.redirect('/')
                    // res.render('userHome', { products: productData, user: userData })
                } else {
                    res.render('login', { message: 'invalid password' })
                }
            } else {
                res.render('login', { message: 'User is Blocked' })
            }

        } else {
            res.render('login', { message: 'User not found' })
        }
    } catch (error) {
        console.log(error.message)
    }
}



const checkUniqueEmail = async (req, res, next) => {
    const { email } = req.body;

    try {
        const existingUser = await User.findOne({ email });

        if (existingUser) {

            res.render('registration', { message: 'Email already exists' })

        } else {
            next();
        }

    } catch (err) {
        return res.status(500).json({ error: 'Database error' });
    }
};




const forgotPassword = async (req, res) => {
    try {

        res.render('forgotPassword', { message: '' })


    } catch (error) {
        console.log(error.message)
    }
}

const getPasswordOtp=async(req,res)=>{
    try {
        req.session.forgotPasswordEmail=req.body.email
        res.redirect('/generatePasswordOtp')
    } catch (error) {
        console.log(error.message)
    }
}

const generatePasswordOtp = async (req, res) => {
    try {
        const randomotp = Math.floor(1000 + Math.random() * 9000);
        console.log(randomotp)
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'naveenapk048@gmail.com',
                pass: 'ujdt ygiw aozy lgsv'
            }
        });


        const mailOptions = {
            from: 'naveenapk048@gmail.com',
            to: 'apkcity369@gmail.com',
            subject: 'Hello, Nodemailer!',
            text: `Your verification OTP is ${randomotp}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Error sending email: ' + error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
        req.session.passwordOtpTime=Date.now()
        const email = req.session.forgotPasswordEmail
        const userData = await User.findOneAndUpdate({ email: email }, { $set: { otp: randomotp } })
        if (userData) {
            res.render('passwordOtpform', { randomotp, email, message: '' })
        } else {
            res.render('forgotPassword', { message: 'Invalid email' })
        }


    } catch (error) {
        console.log(error.message)
    }
}

const verifypasswordotp = async (req, res) => {
    try {
        const passwordTimeLimit=Date.now()
        console.log('limit'+passwordTimeLimit)
        console.log('start'+req.session.passwordOtpTime)
        const typedotp = req.body.otp
        const email = req.body.email
        const randomotp = req.body.randomotp
        const userData = await User.findOne({ email: email })
        if(passwordTimeLimit-req.session.passwordOtpTime<60000){
            if (typedotp == randomotp) {
                await User.findOneAndUpdate({ email: email }, { $set: { otp: null } })
                res.render('newPassword', { email, message: '' })
            } else {
                res.render('passwordOtpform', { message: 'invalid otp', randomotp: userData.otp, email })
            }
        }else{
            res.render('passwordOtpform', { message: 'invalid otp', randomotp: userData.otp, email })
        }
    } catch (error) {
        console.log(error.message)
    }
}

const resetPassword = async (req, res) => {
    try {
        const email = req.body.email
        // console.log(email)
        const password1 = req.body.password1
        const password2 = req.body.password2
        if (password1 == password2) {
            const userData = await User.findOneAndUpdate({ email: email }, { $set: { password: password1 } })
            if (userData) {
                res.redirect('/')
            }
        } else {
            res.render('newPassword', { email, message: "Password dont match" })
        }

    } catch (error) {
        console.log(error.message)
    }
}

const productDetails = async (req, res) => {
    try {
        const id = req.query.id
        const email = req.session.email
        // console.log(id)
        const productData = await Product.findById({ _id: id })
        const userData = await User.findOne({ email })
        if (productData) {
            res.render('productDetails', { product: productData, user: userData })
        } else {
            res.redirect('/home')

        }

    } catch (error) {
        console.log(error.message)
    }
}

const addToCart = async (req, res) => {
    try {
        // const productId = req.body.productId
        const productId = req.query.productId
        const quantity = parseInt(req.body.quantity, 10) ?? 1
        const email = req.session.email
        const cartItem = {
            productId: productId,
            quantity: quantity
        }
        const userData = await User.findOne({ email: email })
        //    const fullUserData=await User.findOne({email:email}).populate('cart.productId')
        //    const userCart=userData.cart
        //    const userCartData=fullUserData.cart
        let flag = 0;
        //    console.log(fullUserData.cart);
        if (userData && userData.cart) {
            for (i = 0; i < userData.cart.length; i++) {

                if (productId == userData.cart[i].productId) {
                    flag = 1;
                    break;
                }
            }
        }
        if (flag == 0) {
            if (userData) {
                if (userData.is_active == false) {
                    res.render('login', { message: 'User is blocked' })
                } else {
                    await User.findOneAndUpdate(
                        { email: email },
                        { $push: { cart: cartItem } },
                        // {upsert:true,new:true}
                    )
                    res.redirect('/cart')
                    //     res.write('1111')
                    //    res.end()
                }

            } else {
                res.redirect('/login')
            }
        } else {
            const email = req.session.email
            const userData = await User.findOne({ email })
            const productData = await Product.findOne({ _id: productId })
            if (productData) {
                res.render('productDetails', { product: productData, message: "Already exists in cart", user: userData })
            }
        }


    } catch (error) {
        console.log(error.message)
    }
}

const userAccount = async (req, res) => {
    try {
        // const id = req.query.id
        const email = req.session.email;
        const user = await User.findOne({ email: email });
        const orders = await Order.find({ userId: user._id }).populate('products.productId').sort({ orderDate: -1 });
        if (user.is_active == false) {
            res.render('login', { message: 'User is blocked' })
        } else {
            // console.log(orders);
            res.render('userAccount', { user: user, orders })
        }

    } catch (error) {
        console.log(error.message)
    }
}

const addressForm = async (req, res) => {
    try {
        const checkout = req.query.checkout
        console.log(checkout)
        res.render('addressForm',{checkout})
    } catch (error) {
        console.log(error.message)
    }
}

const addAddress = async (req, res) => {
    try {
        const checkout = req.body.checkout
        console.log(checkout)
        const email = req.session.email
        const userData = await User.findOne({ email: email })
        const { fname, lname, country, houseName, city, state, pincode, phone } = req.body
        const result = await User.updateOne({ email: email },
            {
                $push:
                {
                    address:
                    {
                        $each:
                            [
                                {
                                    fname: fname,
                                    lname: lname,
                                    country: country,
                                    housename: houseName,
                                    city: city,
                                    state: state,
                                    pincode: pincode,
                                    phone: phone,
                                    email: email
                                }
                            ]
                    }
                }
            })
        if (result) {
            if(checkout){
                res.redirect('/checkout')
            }else{
            res.redirect('/userAccount')
            }
        }
    } catch (error) {
        console.log(error.message)
    }
}

const showCart = async (req, res) => {
    try {
        const email = req.session.email
        const userData = await User.findOne({ email: email })
        // console.log(userData)
        if (userData) {
            if (userData.is_active == false) {
                res.render('login', { message: 'User is blocked' })
            } else {
                const fullUserData = await User.findOne({ email: email }).populate('cart.productId')
                // console.log(fullUserData.cart)
                // console.log(fullUserData.cart[1].quantity)
                res.render('cart', { user: userData, userCart: fullUserData })
            }

        } else {
            res.redirect('/login')
        }

    } catch (error) {
        console.log(error.message)
    }
}

const deleteFromCart = async (req, res) => {
    try {
        const email = req.session.email
        const cartItemId = req.query.id
        const userData = await User.updateOne(
            { email: email },
            { $pull: { 'cart': { 'productId': cartItemId } } }
        );
        if (userData) {
            res.redirect('/cart')
        }


    } catch (error) {
        console.log(error.message)
    }
}

const showCheckOut = async (req, res) => {
    try {
        const email = req.session.email
        const userData = await User.findOne({ email: email }).populate('cart.productId')
        const coupon = await Coupon.find({ is_active: true, "redeemedUsers.userId": { $ne: userData._id } });

        // console.log(userData)
        if (userData.cart.length > 0) {
            res.render('checkout', { user: userData ,coupon})
        } else {
            res.redirect('/cart')
        }

    } catch (error) {
        console.log(error.message)
    }
}

const applyCoupon=async(req,res)=>{
    try {
        req.session.couponCode=req.query.couponCode
        const couponCode = req.query.couponCode;
        const totalAmount = req.query.totalAmount;
        console.log(couponCode)
        try {
            const couponData = await Coupon.findOne({ couponCode: couponCode });
        
            if (!couponData) {
                return res.status(200).json({
                    message: 'Invalid Coupon',
                    finalPrice: totalAmount
                });
            }
        
            const userData = await User.findOne({ email: req.session.email });
        
            // Check if the user ID is in the redeemedUsers array
            const isRedeemed = couponData.redeemedUsers.some(user => user.userId === userData._id.toString());


        // console.log(isRedeemed)
            if (isRedeemed  || totalAmount<couponData.minPurchase) {
                return res.status(200).json({
                    message: 'Invalid Coupon',
                    finalPrice: totalAmount
                });
            }else{

                const finalPrice = totalAmount - couponData.discount;
                const discountAmount=couponData.discount
                
                res.status(200).json({
                    message: 'Coupon Applied Successfully',
                    finalPrice: finalPrice,
                    couponAmount: discountAmount
                });
            }
        
           
        } catch (error) {
            console.error(error);
            res.status(500).json({
                message: 'Internal Server Error'
            });
        }
        

        
      
    } catch (error) {
        console.log(error.message)
    }
}

const editAddressForm = async (req, res) => {
    try {
        const checkout = req.query.checkoutcode

        const email = req.session.email
        const index = req.query.index
        const userData = await User.findOne({ email: email })
        const address = userData.address[index]
        res.render('editAddressForm', { address, index, checkout })
    } catch (error) {
        console.log(error.message)
    }
}


const updateAddress = async (req, res) => {
    try {
        const email = req.session.email
        const index = req.query.index
        const checkout = req.query.checkout
        // console.log(checkout)
        const userData = await User.findOne({ email: email })
        const { fname, lname, country, houseName, city, state, pincode, phone } = req.body
        const newAddress = {
            fname: fname,
            lname: lname,
            country: country,
            housename: houseName,
            city: city,
            state: state,
            pincode: pincode,
            phone: phone,
            email: email
        }
        userData.address[index] = newAddress
        await userData.save();
        if (checkout) {
            res.redirect('/checkout')
        } else {
            res.redirect('/userAccount')
        }


    } catch (error) {
        console.log(error.message)
    }
}

const updateQuantity = async (req, res) => {
    try {
        const { index, newQuantity } = req.params;
        const email = req.session.email
        // console.log(index)
        // console.log(newQuantity)
        const userData = await User.findOne({ email: email }).populate('cart.productId');

        if (!userData) {
            return res.status(404).send('Product not found');
        }

        // Update the quantity
        //   console.log(userData)
        userData.cart[index].quantity = newQuantity;
        await userData.save();

        // Send a success response
        res.status(200).send('Quantity updated successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}

const updateUserDetails = async (req, res) => {
    try {
        const email = req.session.email
        const { name, nemail, mobile } = req.body
        const userData = await User.findOneAndUpdate({ email }, { $set: { name: name, email: nemail, mobile: mobile } })
        if (userData) {
            res.redirect('/userAccount')
        } else {
            res.write('need to handle')
            res.end()
        }

    } catch (error) {
        console.log(error.message)
    }
}

const checkUniqueEmail2 = async (req, res, next) => {



    try {
        const nemail = req.body.nemail;

        const email = req.session.email
        const userData = await User.findOne({ email: email });
        if (userData) {
            const id = userData._id
            console.log(id);
            const existingUser = await User.findOne({
                _id: { $ne: id },
                email: nemail
            });

            if (existingUser) {

                res.write('email already exists')
                res.end()

            } else {
                next();
            }
        }
    } catch (err) {
        return res.status(500).json({ error: 'Database error' });
    }
};

const updatePassword = async (req, res) => {
    try {
       
        const email = req.session.email
        const { currentPassword, npassword, cpassword } = req.body
        
       
        
        const userData = await User.findOne({ email })
        if (userData.password == currentPassword) {
            if (npassword == cpassword) {
                userData.password = npassword
                userData.save()
            
                res.status(200).json({
                    message3:'success'
                })
            } else {
                res.status(200).json({
                    message2:'Passwords dont match'
                })
            }
        } else {
            res.status(200).json({
                message1:'Invalid Password'
            })
        }
    } catch (error) {
        console.log(error.message)
    }
}



const logout = async (req, res) => {
    try {
        delete req.session.email
        req.session.save()
        res.redirect('/')
    } catch (error) {
        console.log(error.message)
    }
}





module.exports = {
    loadHome,
    loginLoad,
    loadRegister,
    insertUser,
    verifyLogin,
    checkUniqueEmail,
    checkUniqueEmail2,
    forgotPassword,
    resetPassword,
    verifyOtp,
    sendOtp,
    getPasswordOtp,
    generatePasswordOtp,
    verifypasswordotp,
    productDetails,
    userAccount,
    addressForm,
    addAddress,
    addToCart,
    showCart,
    deleteFromCart,
    showCheckOut,
    applyCoupon,
    editAddressForm,
    updateAddress,
    updateQuantity,
    updateUserDetails,
    updatePassword,
    logout
    // forgotPasswordUserHome,
    // verificationOtpUserHome
}