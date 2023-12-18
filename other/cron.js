const Cron = require('node-cron');
const Product =require('../models/productModel')
const Category =require('../models/categoryModel')

// Define your task to be executed
const myTask = async () => {
    console.log('Cron job is running!');
  
    const currentDate = Date.now();
  
    // Update documents where expiry is greater than the current date
    const categoriesToUpdate = await Category.find({ expiry: { $lt: currentDate } ,offerStatus:true});
    console.log(categoriesToUpdate)
    const updatedCategoryIds = categoriesToUpdate.map(category => category._id);
    console.log(updatedCategoryIds)
    console.log('oooooooooooooooooooooooooooooooooooooo')
      
      // Find products associated with the updated categories
     //  const updatedCategoryIds = updateResult2.modifiedCount > 0 ? updateResult2.modifiedCount : [];
      
  
    // Find all products with categoryId matching any of the expired categories
    const productsToUpdate2 = await Product.find({is_active:true, categoryId: { $in: updatedCategoryIds } });
  console.log(productsToUpdate2)

    const updateResult2 = await Category.updateMany(
        { expiry: { $lt: currentDate } },
        { $set: { offerStatus: false } ,expiry:null}
      );

    // categoriesToUpdate.offerStatus=false
    // await categoriesToUpdate.save()


    // console.log(updatedCategoryIds);
    console.log('-------------------------------------------------------------------------------------');
    // console.log(productsToUpdate2);
  
    // Update the found products
//     const updateProductsResult2 = await Product.updateMany(
//   { categoryId: { $in: updatedCategoryIds }},
//   {
//     $set: {
//       catDiscountPercentage: 0,
//       bestDiscount: {
//         $cond: {
//           if: { $gt: ['$discountPercentage', 0] },
//           then: '$discountPercentage',
//           else: 0
//         }
//       },
//       salePrice: {
//         $cond: {
//           if: { $gt: ['$discountPrice', 0] },
//           then: '$discountPrice',
//           else: '$regularPrice'
//         }
//       }
//     }
//   }
// );



  
        const updatePromises = productsToUpdate2.map(async (product) => {
            if(product.discountPercentage>0){
              product.bestDiscount=product.discountPercentage
              product.catDiscountPercentage=null
              product.salePrice=product.discountPrice
              return product.save();
            }else{
              product.discountPrice=null
              product.catDiscountPercentage=null
              product.bestDiscount=0
              product.salePrice = product.regularPrice
              return product.save();
            }
            // product.discountPercentage = 0;
            
        });
    
       
        await Promise.all(updatePromises);
        console.log(updatePromises)



  
    // console.log('Products updated:', updateProductsResult2.nModified);
  };
  
  // Schedule the task to run every minute (*/1)
  // You can adjust the cron expression as needed
  Cron.schedule('* * * * * *', myTask);


  

// Additional cron expression examples:
// - '0 0 * * *': Run every day at midnight
// - '0 12 * * MON-FRI': Run every weekday at noon


module.exports=Cron