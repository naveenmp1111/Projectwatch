const mongoose=require('mongoose')
const brandSchema=mongoose.Schema({
     brandName:{
        type:String,
        required:true
     },
     is_active:{
        type:Boolean,
        default:true
     },
     brandImage:[{
        type:String,
     }]
})

module.exports=mongoose.model('Brand',brandSchema)
