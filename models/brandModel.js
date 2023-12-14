const mongoose=require('mongoose')
const brandSchema=mongoose.Schema({
     brandName:{
        type:String,
        required:true
     },
     is_active:{
        type:Boolean,
        default:true
     }
})

module.exports=mongoose.model('Brand',brandSchema)
