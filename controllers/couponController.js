const Coupon=require('../models/couponModel')
const Category=require('../models/categoryModel')
  

const loadCouponPage=async(req,res)=>{
    try {
        const coupon=await Coupon.find({})
        res.render('coupon',{coupon})
    } catch (error) {
        console.log(error.message)
        res.redirect('/500')
    }
}

const addCoupon=async(req,res)=>{
    try{
        const {couponCode,discount,minPurchase,expiry}=req.body
        const expirydate=expiry
        const newCoupon=new Coupon({
            couponCode:couponCode,
            discount:discount,
            minPurchase:minPurchase,
            expiry:expirydate,
            is_active:true
        })
        await newCoupon.save()
        res.redirect('/admin/coupon')

    }catch(error){
        console.log(error.message)
        res.redirect('/500')
    }
}

const blockCoupon=async(req,res)=>{
    try {
        console.log(req.query.id)
        const couponId=req.query.id
        await Coupon.findByIdAndUpdate({_id:couponId},{$set:{is_active:false}})
        res.redirect('/admin/coupon')
    } catch (error) {
        console.log(error.message)
        res.redirect('/500')
    }
}

const unblockCoupon=async(req,res)=>{
    try {
        const couponId=req.query.id
        await Coupon.findByIdAndUpdate({_id:couponId},{$set:{is_active:true}})
        res.redirect('/admin/coupon')
    } catch (error) {
        console.log(error.message)
        res.redirect('/500')
    }
}


module.exports={
    loadCouponPage,
    addCoupon,
    blockCoupon,
    unblockCoupon
}