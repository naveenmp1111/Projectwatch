const User = require('../models/userModel')
const Product = require('../models/productModel')
const Order = require('../models/orderModel')
const { use } = require('../routes/adminRoute')
const Coupon=require('../models/couponModel')

const Razorpay=require('razorpay')
var instance = new Razorpay({
  key_id: 'rzp_test_xgAbYbKWLNZHR0',
  key_secret: 'pBaRn0FrJtHGQABUEkHfJwCZ'
});


const placeOrder = async (req, res) => {
    try {
        const couponCode=req.body.couponSelected
        const email = req.session.email
        const userData = await User.findOne({ email: email }).populate('cart.productId')
        const addressIndex = req.body.selectAddress       
        const paymentMethod = req.body.payment_option
        let totalAmount =req.body.totalAmount
        // let couponCode
        // if(req.body.couponSelected){
        //     couponCode=req.body.couponSelected
        // }else{
        //     couponCode=null
        // }

       const couponData=await Coupon.findOne({couponCode:couponCode})
       let coupon = null
        if(couponData!=null){
            const finalPrice=totalAmount-couponData.discount
            totalAmount=finalPrice
            const obj={
                userId:userData._id
            }
            await couponData.redeemedUsers.push(obj)
            couponData.save()
            coupon=couponData.discount
        }else{
            totalAmount = req.body.totalAmount
        }

        // console.log(req.body.selectAddress)

        // console.log(paymentMethod)

        if (addressIndex >= 0 && userData.cart.length > 0) {

            const userCart = userData.cart

            // console.log(userCart)
            for (i = 0; i < userCart.length; i++) {
                userCart[i].productId.quantity -= userCart.quantity

                if (userCart[i].productId.quantity < 0) {
                    // Handle the case where the quantity would go below 0, for example, set it to 0
                    userCart[i].productId.quantity = 0;
                } else {
                    userCart[i].productId.quantity = userCart[i].productId.quantity
                }

                const userData = await Product.findByIdAndUpdate({ _id: userCart[i].productId._id }, { $set: { quantity: userCart[i].productId.quantity - userCart[i].quantity } })
                await userData.save()
            }

            let arr = []
            userCart.forEach((item) => {

                arr.push({
                    productId: item.productId._id,
                    quantity: item.quantity,
                    // is_active:true
                })
            })
            // console.log(arr);

            //-------------------orderId Generation----------------->

            const randomid = randomId()
            async function randomId() {
                const min = 100000;
                const max = 999999;
                const randomSixDigitNumber = Math.floor(Math.random() * (max - min + 1)) + min;
                const orderData = await Order.findOne({ orderId: randomSixDigitNumber })
                if (orderData) {
                    return await randomId()
                } else {
                    return randomSixDigitNumber
                }
            }
            const orderId = await randomid

            const order = new Order({
                userId: userData._id,
                products: arr,
                addressIndex: addressIndex,
                totalAmount: totalAmount,
                paymentMethod: paymentMethod,
                orderId: orderId,
                coupon:coupon
            })
            const orderData = await order.save()

            if (orderData) {
                userData.cart = []
                await userData.save()
                setTimeout(() => {
                    res.redirect('/userAccount')
                }, 2000)

            }
        } else {
            res.redirect('/checkOut')
        }



    } catch (error) {
        console.log(error.message)
    }
}

const orderDetails = async (req, res) => {
    try {
        const email = req.session.email
        const orderId = req.query.id
        const userData = await User.findOne({ email: email }).populate('cart.productId')
        const orderData = await Order.findById({ _id: orderId }).populate('products.productId').populate('userId')
        // console.log(orderData.userId);
        res.render('orderDetails', { orders: orderData })
    } catch (error) {
        console.log(error.message)
    }
}

const cancelOrder = async (req, res) => {
    try {
        const email = req.session.email
        const orderId = req.query.id
        const userData = await User.findOne({ email: email }).populate('cart.productId')
        const orderData = await Order.findById({ _id: orderId }).populate('products.productId').populate('userId')


        // console.log(orderData)
        orderData.orderstatus = 'Cancelled'
        await orderData.save()

        async function processOrder(orderData) {
            for (const item of orderData.products) {
                const productId = item.productId._id;
                console.log(productId)
                const quantityToAdd = item.quantity
                //   console.log(productId)
                // Find the product by its _id
                const productData = await Product.findById(productId);
                productData.quantity += quantityToAdd;
                await productData.save()

                // Do something with the productData, for example:
                if (productData)
                    console.log(productData);
                else
                    console.log('no data found')
            }
        }

        // Call the async function
        processOrder(orderData);
        //updating wallet
        if(orderData.paymentStatus=='Success'){
            userData.wallet+=parseFloat(orderData.totalAmount)
            await userData.save()
            res.redirect('/orderDetails?id=' + orderId)
        }


        res.redirect('/orderDetails?id=' + orderId)
    } catch (error) {
        console.log(error.message)
    }
}

const returnOrder = async (req, res) => {
    try {
        const email = req.session.email
        const orderId = req.query.id
        const userData = await User.findOne({ email: email }).populate('cart.productId')
        const orderData = await Order.findById({ _id: orderId }).populate('products.productId').populate('userId')


        // console.log(orderData)
        orderData.orderstatus = 'Returned'
        await orderData.save()

        async function processOrder(orderData) {
            for (const item of orderData.products) {
                const productId = item.productId._id;
                console.log(productId)
                const quantityToAdd = item.quantity
                //   console.log(productId)
                // Find the product by its _id
                const productData = await Product.findById(productId);
                productData.quantity += quantityToAdd;
                await productData.save()

                // Do something with the productData, for example:
                if (productData)
                    console.log(productData);
                else
                    console.log('no data found')
            }
        }

        // Call the async function
        processOrder(orderData);
        //updating wallet
        if(orderData.paymentStatus=='Success'){
            userData.wallet+=parseFloat(orderData.totalAmount)
            await userData.save()
            res.redirect('/orderDetails?id=' + orderId)
        }


        res.redirect('/orderDetails?id=' + orderId)
    } catch (error) {
        console.log(error.message)
    }
}

const onlinePayment = async (req, res) => {
    try {
        // console.log(req.body.totalAmount)
        // console.log(req.body.couponCode)
        let totalAmount = parseFloat(req.query.totalAmount); // Assuming you are using query parameters
        console.log('HAI');
        console.log(totalAmount);
        const couponCode = req.session.couponCode; // Assuming you are using query parameters
        console.log(couponCode);
        const couponData = await Coupon.findOne({ couponCode: couponCode });
        console.log(couponData);
        const userData= await User.findOne({email:req.session.email})

        let coupon = null
        if(couponData!=null){
            const finalPrice=totalAmount-couponData.discount
            totalAmount=finalPrice
            // const obj={
            //     userId:userData._id
            // }
            // await couponData.redeemedUsers.push(obj)
            // couponData.save()
            coupon=couponData.discount
        }else{
            totalAmount = req.query.totalAmount
        }

        // console.log('HAI');
        // console.log(totalAmount);
        var options = {
            amount: totalAmount * 100,
            currency: "INR",
            receipt: "order_rcptid_11"
        };

        // Rest of your code...
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Internal Server Error'
        });
    }



    // Creating the Razorpay order
    instance.orders.create(options, async function (err, razorOrder) {
        if (err) {
            console.log(err.message);
            res.status(500).json({ error: "Failed to create order" });
        } else {
            // Sending the order details back to the client

            res.status(200).json({
                message: "Order placed successfully.",
                razorOrder: razorOrder,
                paymentStatus: "Successfull"// You can customize this based on your logic
            });
            // }
        }
    });
}

const paymentSuccess = async (req, res) => {
    try {
        console.log(req.query.addressIndex)
        console.log(req.query.totalAmount);
        const email = req.session.email
        const userData = await User.findOne({ email: email }).populate('cart.productId')
        const addressIndex = req.query.addressIndex
        let totalAmount = req.query.totalAmount
        const couponCode=req.query.couponCode
        const paymentMethod = 'Paypal'


        const couponData=await Coupon.findOne({couponCode:couponCode})
       let coupon = null
        if(couponData!=null){
            const finalPrice=totalAmount-couponData.discount
            totalAmount=finalPrice
            const obj={
                userId:userData._id
            }
            await couponData.redeemedUsers.push(obj)
            couponData.save()
            coupon=couponData.discount
        }else{
            totalAmount = req.body.totalAmount
        }

        if (addressIndex >= 0 && userData.cart.length > 0) {

        const userCart = userData.cart

        // console.log(userCart)
        for (i = 0; i < userCart.length; i++) {
            // console.log('coming inside')
            userCart[i].productId.quantity -= userCart.quantity

            if (userCart[i].productId.quantity < 0) {
                // Handle the case where the quantity would go below 0, for example, set it to 0
                userCart[i].productId.quantity = 0;
            } else {
                userCart[i].productId.quantity = userCart[i].productId.quantity
            }

            const userData = await Product.findByIdAndUpdate({ _id: userCart[i].productId._id }, { $set: { quantity: userCart[i].productId.quantity - userCart[i].quantity } })
            await userData.save()
        }
        let arr = []
        userCart.forEach((item) => {

            arr.push({
                productId: item.productId._id,
                quantity: item.quantity,
                // is_active:true
            })
        })

        //-------------------orderId Generating----------------->

        const randomid = randomId()
        async function randomId() {
            const min = 100000;
            const max = 999999;
            const randomSixDigitNumber = Math.floor(Math.random() * (max - min + 1)) + min;
            const orderData = await Order.findOne({ orderId: randomSixDigitNumber })
            if (orderData) {
                return await randomId()
            } else {
                return randomSixDigitNumber
            }
        }
        const orderId = await randomid
        const order = new Order({
            userId: userData._id,
            products: arr,
            addressIndex: addressIndex,
            totalAmount: totalAmount,
            paymentMethod: paymentMethod,
            orderId: orderId,
            paymentStatus: 'Success',
            coupon:coupon
        })
        const orderData = await order.save()

        if (orderData) {
            userData.cart = []
            await userData.save()

            res.redirect('/userAccount')
        }
        }
        
    } catch (error) {
        console.log(error.message)
    }
}

const checkWallet =async(req,res)=>{
    try {
        const couponCode=req.session.couponCode
        const email = req.session.email
        const userData = await User.findOne({ email: email }).populate('cart.productId')
        const addressIndex = req.query.addressIndex       
        let totalAmount =req.query.totalAmount
        console.log(totalAmount)

       const couponData=await Coupon.findOne({couponCode:couponCode})

        if(couponData!=null){
            const finalPrice=totalAmount-couponData.discount
            totalAmount=finalPrice
        }
        console.log(userData.wallet)
        if(totalAmount>userData.wallet){
            res.status(200).json({
                message:'Insufficient Balance in Wallet'
            })
        }else{
            // res.redirect(`/walletpayment?addressIndex=${addressIndex}&totalAmount=${totalAmount}`)
            res.status(200).json({status:"Success"})
        }

    } catch (error) {
        console.log(error.message)
    }
}

const walletPayment = async (req, res) => {
    try {
        console.log('wallet')
        const couponCode=req.session.couponCode
        const email = req.session.email
        const userData = await User.findOne({ email: email }).populate('cart.productId')
        const addressIndex = req.query.addressIndex       
        const paymentMethod = 'Wallet'
        let totalAmount =parseFloat(req.query.totalAmount)
        console.log(totalAmount)

       const couponData=await Coupon.findOne({couponCode:couponCode})

       let coupon = null
       if(couponData!=null){
           const finalPrice=totalAmount-couponData.discount
           totalAmount=finalPrice
           const obj={
               userId:userData._id
           }
           await couponData.redeemedUsers.push(obj)
           await couponData.save()
           coupon=couponData.discount
       }else{
           totalAmount = req.query.totalAmount
       }

        userData.wallet= userData.wallet-totalAmount


        await userData.save()
        // console.log('his')

        if (addressIndex >= 0 && userData.cart.length > 0) {

            const userCart = userData.cart

            // console.log(userCart)
            for (i = 0; i < userCart.length; i++) {
                userCart[i].productId.quantity -= userCart.quantity

                if (userCart[i].productId.quantity < 0) {
                // Handle the case where the quantity would go below 0, for example, set it to 0
                    userCart[i].productId.quantity = 0;
                } else {
                    userCart[i].productId.quantity = userCart[i].productId.quantity
                }

                const userData = await Product.findByIdAndUpdate({ _id: userCart[i].productId._id }, { $set: { quantity: userCart[i].productId.quantity - userCart[i].quantity } })
                // await userData.save()
            }

            let arr = []
            userCart.forEach((item) => {

                arr.push({
                    productId: item.productId._id,
                    quantity: item.quantity,
                    // is_active:true
                })
            })
            // console.log(arr);

            //-------------------orderId Generation----------------->

            const randomid = randomId()
            async function randomId() {
                const min = 100000;
                const max = 999999;
                const randomSixDigitNumber = Math.floor(Math.random() * (max - min + 1)) + min;
                const orderData = await Order.findOne({ orderId: randomSixDigitNumber })
                if (orderData) {
                    return await randomId()
                } else {
                    return randomSixDigitNumber
                }
            }
            const orderId = await randomid

            const order = new Order({
                userId: userData._id,
                products: arr,
                addressIndex: addressIndex,
                totalAmount: totalAmount,
                paymentMethod: paymentMethod,
                orderId: orderId,
                paymentStatus:'Success',
                coupon:coupon
            })
            const orderData = await order.save()
            console.log(orderData)

            if (orderData) {              
                userData.cart = []
                await userData.save()            
                setTimeout(() => {
                    res.redirect('/userAccount')
                }, 2000)
            }
        } else {
            res.redirect('/checkOut')
        }



    } catch (error) {
        console.log(error.message)
    }
}


module.exports = {
    placeOrder,
    orderDetails,
    cancelOrder,
    onlinePayment,
    paymentSuccess,
    checkWallet,
    walletPayment,
    returnOrder
}