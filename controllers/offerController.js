const User = require('../models/userModel')
const Product = require('../models/productModel')
const Category = require('../models/categoryModel')
const Order = require('../models/orderModel')
const Brand = require('../models/brandModel')




const categoryOffer=async(req,res)=>{
    try {
        const categoryData=await Category.find({})
        console.log(categoryData)
        res.render('categoryOffer',{category:categoryData})
    } catch (error) {
        console.log(error.message)
    }
}

const addCategoryOffer=async(req,res)=>{
    try {
        const id=req.query.categoryId
        const category=await Category.find({})
        const specificCategory=await Category.findById({_id:id})
        res.render('addCategoryOffer',{specificCategory,category})
    } catch (error) {
        console.log(error.message)
    }
}



const updateCategoryOffer=async(req,res)=>{
    try {
        console.log(req.body.expiry)
        console.log(typeof req.body.discount)
        const categoryId=req.query.categoryId
        const discount=parseFloat(req.body.discount)
        const expiry=req.body.expiry
        const categoryData=await Category.findByIdAndUpdate({_id:categoryId},{$set:{discount:discount,expiry:expiry,offerStatus:true}})
        const discountMultiplier = 1 - discount / 100;
        console.log(discountMultiplier)

        // Update product data
        // const updateProducts = await Product.updateMany(
        //   { categoryId: categoryId },
        //   [
        //     {
        //       $set: {
        //         catDiscountPercentage: discount,
        //         discountPrice: {
        //           $round: {
        //             $multiply: ['$regularPrice', discountMultiplier]
        //           }
        //         }
        //       }
        //     }
        //   ]
        // );


        const updateProducts = await Product.updateMany(
          { categoryId: categoryId },
          [
            {
              $set: {
                catDiscountPercentage: discount,
                bestDiscount: {
                  $cond: {
                    if: { $gt: ['$discountPercentage', discount] },
                    then: '$discountPercentage',
                    else: discount
                  }
                },
                salePrice: {
                  $cond: {
                    if: { $lt: ['$discountPercentage', discount] },
                    then: {
                      $round: {
                        $multiply: ['$regularPrice', discountMultiplier]
                      }
                    },
                    else: '$salePrice' // Keep the existing salePrice if the condition is not met
                  }
                }
              }
            }
          ]
        );
        
        
        
        
          console.log(updateProducts)
          
        if(categoryData){
            res.redirect('/admin/categoryOffer')
        }
    } catch (error) {
        console.log(error.message)
    }
}

const deleteCategoryOffer=async(req,res)=>{
  try {
      // console.log(req.body.expiry)
      // console.log(typeof req.body.discount)

      const categoryId=req.query.categoryId
      // const discount=parseFloat(req.query.discount)
      const expiry=req.body.expiry
      const categoryData=await Category.findByIdAndUpdate({_id:categoryId},{$set:{discount:null,expiry:null,offerStatus:false}})
      // const discountMultiplier = 1 - discount / 100;
      // console.log(discountMultiplier)

      // Update product data
      const updateProducts = await Product.updateMany(
        { categoryId: categoryId },
        [
          {
            $set: {
              catDiscountPercentage: null,
              bestDiscount: {
                $cond: {
                  if: { $ifNull: ['$discountPercentage', false] },
                  then: '$discountPercentage',
                  else: null
                }
              },
              salePrice: {
                $subtract: [
                  '$regularPrice',
                  {
                    $multiply: [
                      '$regularPrice',
                      { $ifNull: [{ $divide: ['$discountPercentage', 100] }, 1] }
                    ]
                  }
                ]
              }
            }
          }
        ]
      );
      
      
      
        // console.log(updateProducts)
        
      if(categoryData){
          res.redirect('/admin/categoryOffer')
      }
  } catch (error) {
      console.log(error.message)
  }
}


module.exports={
    categoryOffer,
    addCategoryOffer,
    updateCategoryOffer,
    deleteCategoryOffer
}