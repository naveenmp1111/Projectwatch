const mongoose=require('mongoose')
const contactSchema=mongoose.Schema({
   name:{
    type:String,
    required:true
   },
   email:{
    type:String,
    required:true
   },
   mobile:{
    type:Number
   },
   subject:{
    type:String
   },
   message:{
    type:String
   }
})

module.exports=mongoose.model('Contact',contactSchema)