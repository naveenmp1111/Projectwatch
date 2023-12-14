const mongoose=require('mongoose')
const orderSchema=mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    products:[{
        productId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Product',
            required:true
        },
        quantity:{
            type:Number,
            required:true
        }
    }],
    addressIndex:{
        type:Number,
        default:0, 
        required:true
    },
    orderDate:{
        type:Date,
        default:Date.now
    },
    totalAmount:{
        type:String,
        required:true
    },
    orderstatus:{
        type:String,
        enum:['Order Placed','Shipped','Delivered','Cancelled','Returned'],
        default:'Order Placed'
    },
    paymentStatus:{
        type:String,
        enum:['Pending','Success','Failed'],
        default:'Pending'
    },
    paymentMethod:{
        type:String,
        required:true
    },
    orderId:{
        type:String
    },
    coupon:{
        type:Number, 
        default:null
    }
    
})

module.exports=mongoose.model('Order',orderSchema)