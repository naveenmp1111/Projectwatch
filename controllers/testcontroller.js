// try {
//     // Aggregate orders by month and count the number of products
//     const orderData = await Order.aggregate([
//         {
//             $unwind: '$products' // Unwind the products array
//         },
//         {
//             $group: {
//                 _id: { month: { $month: '$orderDate' } },
//                 totalOrders: { $sum: 1 },
//                 totalProducts: { $sum: '$products.quantity' },
//             }
//         },
//         {
//             $sort: {
//                 '_id.month': 1 // Sort by month
//             }
//         }
//     ]);

//     const fullOrderData = await Order.find({}).sort({orderDate:-1}).populate('userId')

//     const orderAmount = await Order.aggregate([
//         {
//           $group: {
//             _id: null,
//             totalAmountSum: { $sum: { $toDouble: '$totalAmount' } },
//             totalOrders: { $sum: 1 }
//           }
//         }
//       ])

//     const totalAmount = orderAmount[0].totalAmountSum
//     const totalOrders = orderAmount[0].totalOrders

//     const productData = await Product.aggregate([
//         {
//             $group:{
//                 _id:null,
//                 totalProducts:{$sum:1}
//             }
//         }
//     ])

//     const totalProducts = productData[0].totalProducts

//     const userData = await User.aggregate([
//         {
//             $group: {
//                 _id: { $month: '$accountCreated' },
//                 totalRegister: { $sum: 1 },
//             }
//         },
//         {
//             $sort: {
//                 '_id': 1 // Sort by month
//             }
//         }
//     ]);


//     const totalUsersFind = await User.aggregate([
//         {
//             $group:{
//                 _id:null,
//                 totalUsers:{$sum:1}
//             }
//         }
//     ])
    
//     const totalUsers = totalUsersFind[0].totalUsers

//     const categoryData = await Product.aggregate([
//         {
//             $group: {
//                 _id: '$categoryid',
//                 totalProducts: { $sum: '$quantity' }
//             }
//         },
//         {
//             $lookup: {
//                 from: 'categories',  // Assuming your category collection is named 'categories'
//                 localField: '_id',
//                 foreignField: '_id',
//                 as: 'category'
//             }
//         },
//         {
//             $unwind: '$category'
//         },
//         {
//             $project: {
//                 _id: 0,
//                 categoryName: '$category.categoryName',
//                 totalProducts: 1
//             }
//         }
//     ]);
//     console.log(categoryData)

//     const orderStats = await Order.aggregate([
//         {
//           $unwind: '$products'
//         },
//         {
//           $lookup: {
//             from: 'products',
//             localField: 'products.productId',
//             foreignField: '_id',
//             as: 'productInfo'
//           }
//         },
//         {
//           $unwind: '$productInfo'
//         },
//         {
//           $lookup: {
//             from: 'categories',
//             localField: 'productInfo.categoryid',
//             foreignField: '_id',
//             as: 'categoryInfo'
//           }
//         },
//         {
//           $group: {
//             _id: '$categoryInfo._id',
//             categoryName: { $first: '$categoryInfo.categoryName' },
//             orderCount: { $sum: 1 }
//           }
//         }
//       ]);
//         console.log(orderStats)
//         const categoryNames = JSON.stringify(orderStats.map(stat => stat.categoryName).flat());
//         const orderCounts = JSON.stringify(orderStats.map(stat => stat.orderCount));

//         console.log(categoryNames)
//         console.log(orderCounts)
//     // Extracting the total orders and products for each month
//     const monthlyData = Array.from({ length: 12 }, (_, index) => {
//         const monthOrderData = orderData.find(item => item._id.month === index + 1) || { totalOrders: 0, totalProducts: 0 };
//         const monthUserData = userData.find(item => item._id === index + 1) || { totalRegister: 0 };
//         return {
//             totalOrders: monthOrderData.totalOrders,
//             totalProducts: monthOrderData.totalProducts,
//             totalRegister: monthUserData.totalRegister
//         };
        
//     });

//     console.log(monthlyData)
    

//     const totalOrdersJson= JSON.stringify(monthlyData.map(item => item.totalOrders));
//     const totalProductsJson = JSON.stringify(monthlyData.map(item => item.totalProducts));
//     const totalRegisterJson = JSON.stringify(monthlyData.map(item => item.totalRegister));

//     const categoryLabelsJson = JSON.stringify(categoryData.map(item => item.categoryName));
//     console.log(categoryLabelsJson)
//     const categoryValuesJson = JSON.stringify(categoryData.map(item => item.totalProducts));
  
//     res.render('dashboard', { totalOrdersJson,totalProductsJson ,totalRegisterJson, categoryLabelsJson, categoryValuesJson,
//         totalAmount,totalOrders,totalProducts,totalUsers,fullOrderData,categoryNames,orderCounts});
// } catch (error) {
//     console.log(error);
//     res.status(500).send('Internal Server Error');
//     }





{/* <script>
            function validateForm() {
               
                var title = document.querySelector('select[name="title"]').value;
                
        
                if (
                    title === '' ||
                   
                ) {
                    alert('Invalid title');
                    return false;
                }
        
                
                return true;
            }
        </script> */}



 <option value="BJ">Benin</option>
                                       

//  -- map start -->
//             <div class="mapouter">
//                 <div class="gmap_canvas">
//                     <iframe width="300" height="300" id="gmap_canvas" src="https://maps.google.com/maps?q=kochi&t=&z=13&ie=UTF8&iwloc=&output=embed" frameborder="0" scrolling="no" marginheight="0" marginwidth="0"></iframe>
//                 </div>
//             </div>
//        <!-- map End -->



 if (bannerLandscapeData && bannerLandscapeData.length > 0) { 
    <div class="hero-slider-1 style-2 dot-style-1 dot-style-1-position-1" style="height: 700px; ;" >
      <% for (let i = 0; i < bannerLandscapeData.length; i++) { %>
        <div class="single-hero-slider single-animation-wrap" >
          <div class="container" style="height: 700px; ">
            <div class="slider-1-height-2 slider-animated-1">
              <div class="hero-slider-content-2" style="background-image: url('/<%=bannerLandscapeData[i].bannerImages %>'); background-size: cover; height: 600px; border-radius: 20px">
                <!-- Background image is set here -->
                <h5 class="animated" style="color: white;"><%=bannerLandscapeData[i].bannerName %></h5>
                <h3 class="animated fw-900" style="color: white;"><%=bannerLandscapeData[i].bannerText1 %></h3>
                <h3 class="animated fw-900 " style="color: rgb(255, 0, 0)"><%=bannerLandscapeData[i].bannerText2 %></h3>
                <p class="animated" style="color: rgb(255, 255, 255)"><%=bannerLandscapeData[i].bannerText3 %></p>
                <a class="animated btn btn-brush btn-brush-3" style="color: rgb(250, 242, 14)" href="/login"> Shop Now </a>
              </div>
            </div>
          </div>
        </div>
      <% } %>
    </div>
//          <% } %>