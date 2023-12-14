const User = require('../models/userModel')
const Product = require('../models/productModel')
const nodemailer = require('nodemailer')
const Order = require('../models/orderModel')
const Category=require('../models/categoryModel')



const showShop = async (req, res) => {
    try {
        console.log('jai')
        const email = req.session.email
        const userData = await User.findOne({ email: email })
        const categories=await Category.find({})
        const categoryId=req.query.categoryId
        const brandId=req.query.brandId
        console.log(brandId)
        const gender=req.query.gender
        const message=req.query.message
        const sort=req.query.sort
        console.log(req.query.gender)
        console.log(message)
        console.log(gender)
        if(message =='withCategory'){

            if(sort=='ascending'){
                let search=''
                const productData = await Product.find({
                    categoryId: categoryId,
                    is_active: true,
                    catStatus:true
                  }).sort({salePrice:1})
                  
                res.render('shop', { products: productData, user: userData ,search,categories,message:"withCategory",categoryId})
            }else if(sort=='descending'){
                let search=''
                const productData = await Product.find({
                    categoryId: categoryId,
                    is_active: true,
                    catStatus:true
                  }).sort({salePrice:-1})
                  
                res.render('shop', { products: productData, user: userData ,search,categories,message:"withBrand",categoryId})
            }else{
                let search=''
                const productData = await Product.find({
                    categoryId: categoryId,
                    is_active: true,
                    catStatus:true
                  }).sort({date:-1})
                  
                res.render('shop', { products: productData, user: userData ,search,categories,message:"withBrand",categoryId})
            }

        }else if(message == 'withBrand'){

            if(sort=='ascending'){
                let search=''
                const productData = await Product.find({
                    brandId: brandId,
                    is_active: true,
                    catStatus:true
                  }).sort({salePrice:1});
                  
                res.render('shop', { products: productData, user: userData ,search,categories,message:"withCategory",brandId})
            }else if(sort=='descending'){
                let search=''
                const productData = await Product.find({
                    brandId: brandId,
                    is_active: true,
              catStatus:true
                  }).sort({salePrice:-1});
                  
                res.render('shop', { products: productData, user: userData ,search,categories,message:"withBrand",brandId})
                }else{
                    let search=''
                const productData = await Product.find({
                    brandId: brandId,
                    is_active: true,
              catStatus:true
                  }).sort({date:-1});
                  
                res.render('shop', { products: productData, user: userData ,search,categories,message:"withBrand",brandId})
                
                }

        }else if(message =='withGender'){
            //   console.log('coming')
            if(sort=='ascending'){
                let search=''
                const productData = await Product.find({
                    gender:gender,
                    is_active: true,
                    catStatus:true
                  }).sort({salePrice:1})
                  
                res.render('shop', { products: productData, user: userData ,search,categories,message:"withGender",gender})
            }else if(sort=='descending'){
                let search=''
                const productData = await Product.find({
                    gender:gender,
                    is_active: true,
                    catStatus:true
                  }).sort({salePrice:-1})
                  
                res.render('shop', { products: productData, user: userData ,search,categories,message:"withGender",gender})
            }else{
                // console.log('chill')
                let search=''
                // const gender='Mens'
                // console.log(gender)
                const productData = await Product.find({
                    gender:gender,
                    is_active: true,
                    catStatus:true
                  }).sort({date:-1})
                  console.log(productData)
                  
                res.render('shop', { products: productData, user: userData ,search,categories,message:"withGender",gender})
            }
        }else{
            if(sort=='ascending'){
                if(categoryId){
                    let search=''
                    const productData = await Product.find({
                        categoryId: categoryId,
                        is_active: true,
                        catStatus:true
                      }).sort({salePrice:1});
                      
                    res.render('shop', { products: productData, user: userData ,search,categories,message:"withCategory",categoryId})
                }else if(brandId){
                    let search=''
                    const productData = await Product.find({
                        brandId: brandId,
                        is_active: true,
                      catStatus:true
                      }).sort({salePrice:1});;
                      
                    res.render('shop', { products: productData, user: userData ,search,categories,message:"withBrand",brandId})
                }else if(gender){
                    let search=''
                    const productData = await Product.find({
                        gender:gender,
                        is_active: true,
                        catStatus:true
                      }).sort({salePrice:1});;
                      
                    res.render('shop', { products: productData, user: userData ,search,categories,message:"withGender",gender})
                }else{
                    let search=''
                    if(req.query.search){
                        search=req.query.search
                    }
                    const productData = await Product.find({ 
                        is_active: true,
                        catStatus:true,
                        $or:[
                            {title:{$regex:'.*'+search+'.*',$options:'i'}},
                            {brand:{$regex:'.*'+search+'.*',$options:'i'}}
                        ]
                     }).sort({salePrice:1});
                     
                     res.render('shop', { products: productData, user: userData ,search,categories,message:''})
                }
            }else if(sort=='descending'){
                if(categoryId){
                    let search=''
                    const productData = await Product.find({
                        categoryId: categoryId,
                        is_active: true,
                        catStatus:true
                      }).sort({salePrice:-1});;
                      
                    res.render('shop', { products: productData, user: userData ,search,categories,message:"withCategory",categoryId})
                }else if(brandId){
                    let search=''
                    const productData = await Product.find({
                        brandId: brandId,
                        is_active: true,
                      catStatus:true
                      }).sort({salePrice:-1});;
                      
                    res.render('shop', { products: productData, user: userData ,search,categories,message:"withBrand",brandId})
                }else if(gender){
                    let search=''
                    const productData = await Product.find({
                        gender:gender,
                        is_active: true,
                        catStatus:true
                      }).sort({salePrice:-1});;
                      
                    res.render('shop', { products: productData, user: userData ,search,categories,message:"withGender",gender})
                }else{
                    let search=''
                    if(req.query.search){
                        search=req.query.search
                    }
                    const productData = await Product.find({ 
                        is_active: true,
                        catStatus:true,
                        $or:[
                            {title:{$regex:'.*'+search+'.*',$options:'i'}},
                            {brand:{$regex:'.*'+search+'.*',$options:'i'}}
                        ]
                     }).sort({salePrice:-1});
                     
                     res.render('shop', { products: productData, user: userData ,search,categories,message:''})
                }
            }else{
                if(categoryId){
                    let search=''
                    const productData = await Product.find({
                        categoryId: categoryId,
                        is_active: true,
                        catStatus:true
                      });
                      
                    res.render('shop', { products: productData, user: userData ,search,categories,message:"withCategory",categoryId})
                }else if(brandId){
                    let search=''
                    const productData = await Product.find({
                        brandId: brandId,
                        is_active: true,
                      catStatus:true
                      });
                      
                    res.render('shop', { products: productData, user: userData ,search,categories,message:"withBrand",brandId})
                }else if(gender){
                    let search=''
                    const productData = await Product.find({
                        gender:gender,
                        is_active: true,
                        catStatus:true
                      });
                      
                    res.render('shop', { products: productData, user: userData ,search,categories,message:"withGender",gender})
                }else{
                    let search=''
                    if(req.query.search){
                        search=req.query.search
                    }
                    const productData = await Product.find({ 
                        is_active: true,
                        catStatus:true,
                        $or:[
                            {title:{$regex:'.*'+search+'.*',$options:'i'}},
                            {brand:{$regex:'.*'+search+'.*',$options:'i'}}
                        ]
                     }).sort({date:-1})
                     
                     res.render('shop', { products: productData, user: userData ,search,categories,message:''})
                }
            }
        }
        


    } catch (error) {
        console.log(error.message)
    }
}

const homeSort=async(req,res)=>{
    try{
        const userData=await User.findOne({email:req.session.email})
        const categories=await Category.find({is_active:true})
        const sort=req.query.sort
        if(sort=='ascending'){

            const productData=await Product.find({is_active: true,catStatus:true}).sort({salePrice:1})
            res.render('shop',{products: productData, user: userData ,categories,message:''})
        }else if(sort=='descending'){

            const productData=await Product.find({is_active: true,catStatus:true}).sort({salePrice:-1})
            res.render('shop',{products: productData, user: userData ,categories,message:''})
        }
    }catch(error){
        console.log(error.message)
    }
}


const homeDeepSort=async(req,res)=>{
    try{
        const userData=await User.findOne({email:req.session.email})
        const categories=await Category.find({is_active: true})
        const start=parseInt(req.query.start)
        const end=parseInt(req.query.end)
        
        const productData = await Product.find({
            salePrice: {
              $gte: start,
              $lt: end
            },
            is_active: true,
            catStatus:true
          });
          
         res.render('shop',{products: productData, user: userData ,categories,message:''})
        
    }catch(error){
        console.log(error.message)
    }
}

module.exports={
    showShop,
    homeSort,
    homeDeepSort
}