const User = require('../models/userModel')
const Product = require('../models/productModel')
const nodemailer = require('nodemailer')
const Order = require('../models/orderModel')
const Category=require('../models/categoryModel')
const Brand=require('../models/brandModel')




const showShop = async (req, res) => {
    try {
        console.log('jai');
        const email = req.session.email;
        const userData = await User.findOne({ email: email });
        const categories = await Category.find({ is_active: true });
        const brands = await Brand.find({ is_active: true });
        const categoryId = req.query.categoryId;
        const brandId = req.query.brandId;
        const gender = req.query.gender;
        const message = req.query.message;
        const sort = req.query.sort;
        const currentPage = parseInt(req.query.page) || 1;
        const pageSize = 6;

        console.log(req.query.gender);
        console.log(message);
        console.log(gender);

        const getPaginatedProducts = async (query, sortOptions) => {
            const skip = (currentPage - 1) * pageSize;
            return await Product.find(query)
                .populate('brandId')
                .sort(sortOptions)
                .skip(skip)
                .limit(pageSize);
        };

        let query = {};
        let sortOptions = {};

        if (message == 'withCategory') {
            query = {
                categoryId: categoryId,
                is_active: true,
                catStatus: true,
            };
        } else if (message == 'withBrand') {
            query = {
                brandId: brandId,
                is_active: true,
                catStatus: true,
            };
        } else if (message == 'withGender') {
            query = {
                gender: gender,
                is_active: true,
                catStatus: true,
            };
        } else {
            query = {
                is_active: true,
                catStatus: true,
            };

            if (categoryId) {
                query.categoryId = categoryId;
            } else if (brandId) {
                query.brandId = brandId;
            } else if (gender) {
                query.gender = gender;
            }

            let search = '';

            if (req.query.search) {
                search = req.query.search;
                query.$or = [
                    { title: { $regex: '.*' + search + '.*', $options: 'i' } },
                    { brand: { $regex: '.*' + search + '.*', $options: 'i' } },
                ];
            }
        }

        if (sort == 'ascending') {
            sortOptions = { salePrice: 1 };
        } else if (sort == 'descending') {
            sortOptions = { salePrice: -1 };
        } else {
            sortOptions = { date: -1 };
        }

        const totalProducts = await Product.countDocuments(query);
        const totalPages = Math.ceil(totalProducts / pageSize);

        const productData = await getPaginatedProducts(query, sortOptions);

        res.render('shop', {
            products: productData,
            user: userData,
            search: '',
            categories,
            message,
            categoryId,
            brandId, 
            brands,
            gender,
            currentPage,
            totalPages, // Added totalPages
        });
    } catch (error) {
        console.log(error.message);
    }
};

// const showShop = async (req, res) => {
//     try {
//         console.log('jai')
//         const email = req.session.email
//         const userData = await User.findOne({ email: email })
//         const categories=await Category.find({is_active:true})
//         const brands=await Brand.find({is_active:true})
//         const categoryId=req.query.categoryId
//         const brandId=req.query.brandId
//         console.log(brandId)
//         const gender=req.query.gender
//         const message=req.query.message
//         const sort=req.query.sort
//         console.log(req.query.gender)
//         console.log(message)
//         console.log(gender)
//         if(message =='withCategory'){

//             if(sort=='ascending'){
//                 let search=''
//                 const productData = await Product.find({
//                     categoryId: categoryId,
//                     is_active: true,
//                     catStatus:true
//                   }).populate('brandId').sort({salePrice:1})
                  
//                 res.render('shop', { products: productData, user: userData ,search,categories,message:"withCategory",categoryId,brands})
//             }else if(sort=='descending'){
//                 let search=''
//                 const productData = await Product.find({
//                     categoryId: categoryId,
//                     is_active: true,
//                     catStatus:true
//                   }).populate('brandId').sort({salePrice:-1})
                  
//                 res.render('shop', { products: productData, user: userData ,search,categories,message:"withBrand",categoryId,brands})
//             }else{
//                 let search=''
//                 const productData = await Product.find({
//                     categoryId: categoryId,
//                     is_active: true,
//                     catStatus:true
//                   }).populate('brandId').sort({date:-1})
                  
//                 res.render('shop', { products: productData, user: userData ,search,categories,message:"withBrand",categoryId,brands})
//             }

//         }else if(message == 'withBrand'){

//             if(sort=='ascending'){
//                 let search=''
//                 const productData = await Product.find({
//                     brandId: brandId,
//                     is_active: true,
//                     catStatus:true
//                   }).sort({salePrice:1});
                  
//                 res.render('shop', { products: productData, user: userData ,search,categories,message:"withCategory",brandId,brands})
//             }else if(sort=='descending'){
//                 let search=''
//                 const productData = await Product.find({
//                     brandId: brandId,
//                     is_active: true,
//               catStatus:true
//                   }).populate('brandId').sort({salePrice:-1});
                  
//                 res.render('shop', { products: productData, user: userData ,search,categories,message:"withBrand",brandId,brands})
//                 }else{
//                     let search=''
//                 const productData = await Product.find({
//                     brandId: brandId,
//                     is_active: true,
//               catStatus:true
//                   }).populate('brandId').sort({date:-1});
                  
//                 res.render('shop', { products: productData, user: userData ,search,categories,message:"withBrand",brandId,brands})
                
//                 }

//         }else if(message =='withGender'){
//             //   console.log('coming')
//             if(sort=='ascending'){
//                 let search=''
//                 const productData = await Product.find({
//                     gender:gender,
//                     is_active: true,
//                     catStatus:true
//                   }).populate('brandId').sort({salePrice:1})
                  
//                 res.render('shop', { products: productData, user: userData ,search,categories,message:"withGender",gender,brands})
//             }else if(sort=='descending'){
//                 let search=''
//                 const productData = await Product.find({
//                     gender:gender,
//                     is_active: true,
//                     catStatus:true
//                   }).populate('brandId').sort({salePrice:-1})
                  
//                 res.render('shop', { products: productData, user: userData ,search,categories,message:"withGender",gender,brands})
//             }else{
//                 // console.log('chill')
//                 let search=''
//                 // const gender='Mens'
//                 // console.log(gender)
//                 const productData = await Product.find({
//                     gender:gender,
//                     is_active: true,
//                     catStatus:true
//                   }).populate('brandId').sort({date:-1})
//                   console.log(productData)
                  
//                 res.render('shop', { products: productData, user: userData ,search,categories,message:"withGender",gender,brands})
//             }
//         }else{
//             if(sort=='ascending'){
//                 if(categoryId){
//                     let search=''
//                     const productData = await Product.find({
//                         categoryId: categoryId,
//                         is_active: true,
//                         catStatus:true
//                       }).populate('brandId').sort({salePrice:1});
                      
//                     res.render('shop', { products: productData, user: userData ,search,categories,message:"withCategory",categoryId,brands})
//                 }else if(brandId){
//                     let search=''
//                     const productData = await Product.find({
//                         brandId: brandId,
//                         is_active: true,
//                       catStatus:true
//                       }).populate('brandId').sort({salePrice:1});;
                      
//                     res.render('shop', { products: productData, user: userData ,search,categories,message:"withBrand",brandId,brands})
//                 }else if(gender){
//                     let search=''
//                     const productData = await Product.find({
//                         gender:gender,
//                         is_active: true,
//                         catStatus:true
//                       }).populate('brandId').sort({salePrice:1});;
                      
//                     res.render('shop', { products: productData, user: userData ,search,categories,message:"withGender",gender,brands})
//                 }else{
//                     let search=''
//                     if(req.query.search){
//                         search=req.query.search
//                     }
//                     const productData = await Product.find({ 
//                         is_active: true,
//                         catStatus:true,
//                         $or:[
//                             {title:{$regex:'.*'+search+'.*',$options:'i'}},
//                             {brand:{$regex:'.*'+search+'.*',$options:'i'}}
//                         ]
//                      }).populate('brandId').sort({salePrice:1});
                     
//                      res.render('shop', { products: productData, user: userData ,search,categories,message:'',brands})
//                 }
//             }else if(sort=='descending'){
//                 if(categoryId){
//                     let search=''
//                     const productData = await Product.find({
//                         categoryId: categoryId,
//                         is_active: true,
//                         catStatus:true
//                       }).sort({salePrice:-1});;
                      
//                     res.render('shop', { products: productData, user: userData ,search,categories,message:"withCategory",categoryId,brands})
//                 }else if(brandId){
//                     let search=''
//                     const productData = await Product.find({
//                         brandId: brandId,
//                         is_active: true,
//                       catStatus:true
//                       }).populate('brandId').sort({salePrice:-1});;
                      
//                     res.render('shop', { products: productData, user: userData ,search,categories,message:"withBrand",brandId,brands})
//                 }else if(gender){
//                     let search=''
//                     const productData = await Product.find({
//                         gender:gender,
//                         is_active: true,
//                         catStatus:true
//                       }).populate('brandId').sort({salePrice:-1});;
                      
//                     res.render('shop', { products: productData, user: userData ,search,categories,message:"withGender",gender,brands})
//                 }else{
//                     let search=''
//                     if(req.query.search){
//                         search=req.query.search
//                     }
//                     const productData = await Product.find({ 
//                         is_active: true,
//                         catStatus:true,
//                         $or:[
//                             {title:{$regex:'.*'+search+'.*',$options:'i'}},
//                             {brand:{$regex:'.*'+search+'.*',$options:'i'}}
//                         ]
//                      }).populate('brandId').sort({salePrice:-1});
                     
//                      res.render('shop', { products: productData, user: userData ,search,categories,message:'',brands})
//                 }
//             }else{
//                 if(categoryId){
//                     let search=''
//                     const productData = await Product.find({
//                         categoryId: categoryId,
//                         is_active: true,
//                         catStatus:true
//                       }).populate('brandId');
                      
//                     res.render('shop', { products: productData, user: userData ,search,categories,message:"withCategory",categoryId,brands})
//                 }else if(brandId){
//                     let search=''
//                     const productData = await Product.find({
//                         brandId: brandId,
//                         is_active: true,
//                       catStatus:true
//                       }).populate('brandId');
                      
//                     res.render('shop', { products: productData, user: userData ,search,categories,message:"withBrand",brandId,brands})
//                 }else if(gender){
//                     let search=''
//                     const productData = await Product.find({
//                         gender:gender,
//                         is_active: true,
//                         catStatus:true
//                       }).populate('brandId');
                      
//                     res.render('shop', { products: productData, user: userData ,search,categories,message:"withGender",gender,brands})
//                 }else{
//                     let search=''
//                     if(req.query.search){
//                         search=req.query.search
//                     }
//                     const productData = await Product.find({ 
//                         is_active: true,
//                         catStatus:true,
//                         $or:[
//                             {title:{$regex:'.*'+search+'.*',$options:'i'}},
//                             {brand:{$regex:'.*'+search+'.*',$options:'i'}}
//                         ]
//                      }).populate('brandId').sort({date:-1})
                     
//                      res.render('shop', { products: productData, user: userData ,search,categories,message:'',brands})
//                 }
//             }
//         }
        


//     } catch (error) {
//         console.log(error.message)
//     }
// }




// const homeSort=async(req,res)=>{
//     try{
//         const userData=await User.findOne({email:req.session.email})
//         const categories=await Category.find({is_active:true})
//         const brands=await Brand.find({is_active:true})
//         const sort=req.query.sort
//         if(sort=='ascending'){

//             const productData=await Product.find({is_active: true,catStatus:true}).populate('brandId').sort({salePrice:1})
//             res.render('shop',{products: productData, user: userData ,categories,message:'',brands})
//         }else if(sort=='descending'){

//             const productData=await Product.find({is_active: true,catStatus:true}).populate('brandId').sort({salePrice:-1})
//             res.render('shop',{products: productData, user: userData ,categories,message:'',brands})
//         }
//     }catch(error){
//         console.log(error.message)
//     }
// }

const homeSort = async (req, res) => {
    try {
        const userData = await User.findOne({ email: req.session.email });
        const categories = await Category.find({ is_active: true });
        const brands = await Brand.find({ is_active: true });
        const sort = req.query.sort;
        const currentPage = parseInt(req.query.page) || 1;
        const pageSize = 6;

        const getPaginatedProducts = async (sortOptions) => {
            const skip = (currentPage - 1) * pageSize;
            return await Product.find({ is_active: true, catStatus: true })
                .populate('brandId')
                .sort(sortOptions)
                .skip(skip)
                .limit(pageSize);
        };

        let sortOptions = {};

        if (sort == 'ascending') {
            sortOptions = { salePrice: 1 };
        } else if (sort == 'descending') {
            sortOptions = { salePrice: -1 };
        }

        const totalProducts = await Product.countDocuments({ is_active: true, catStatus: true });
        const totalPages = Math.ceil(totalProducts / pageSize);

        const productData = await getPaginatedProducts(sortOptions);

        res.render('shop', {
            products: productData,
            user: userData,
            categories,
            message: '',
            brands,
            currentPage,
            totalPages, // Added totalPages
        });
    } catch (error) {
        console.log(error.message);
    }
};



// const homeDeepSort=async(req,res)=>{
//     try{
//         const userData=await User.findOne({email:req.session.email})
//         const categories=await Category.find({is_active: true})
//         const brands=await Brand.find({is_active:true})
//         const start=parseInt(req.query.start)
//         const end=parseInt(req.query.end)
        
//         const productData = await Product.find({
//             salePrice: {
//               $gte: start,
//               $lt: end
//             },
//             is_active: true,
//             catStatus:true
//           });
          
//          res.render('shop',{products: productData, user: userData ,categories,message:'',brands})
        
//     }catch(error){
//         console.log(error.message)
//     }
// }
const homeDeepSort = async (req, res) => {
    try {
        const userData = await User.findOne({ email: req.session.email });
        const categories = await Category.find({ is_active: true });
        const brands = await Brand.find({ is_active: true });
        const start = parseInt(req.query.start);
        const end = parseInt(req.query.end);
        const currentPage = parseInt(req.query.page) || 1;
        const pageSize = 6;

        const getPaginatedProducts = async () => {
            const skip = (currentPage - 1) * pageSize;
            return await Product.find({
                salePrice: {
                    $gte: start,
                    $lt: end
                },
                is_active: true,
                catStatus: true
            })
            .skip(skip)
            .limit(pageSize);
        };

        const totalProducts = await Product.countDocuments({
            salePrice: {
                $gte: start,
                $lt: end
            },
            is_active: true,
            catStatus: true
        });
        const totalPages = Math.ceil(totalProducts / pageSize);

        const productData = await getPaginatedProducts();

        res.render('shop', {
            products: productData,
            user: userData,
            categories,
            message: '',
            brands,
            currentPage,
            totalPages // Added totalPages
        });
    } catch (error) {
        console.log(error.message);
    }
};


module.exports={
    showShop,
    homeSort,
    homeDeepSort
}