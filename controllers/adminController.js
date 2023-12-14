const User = require('../models/userModel')
const Product = require('../models/productModel')
const Category = require('../models/categoryModel')
const Order = require('../models/orderModel')
const Brand = require('../models/brandModel')
const sharp =require('sharp')
const fs =require('fs')


const loadLogin = async (req, res) => {
    try {
        console.log('hadf')
        // await Product.updateMany({},{$set:{catStatus:true}})
        res.render('login', { message: '' })
    } catch (error) {
        console.log(error.message)
    }
}

const verifyLogin = async (req, res) => {
    try {
        const { email } = req.body
        const { password } = req.body
        const userData = await User.findOne({ email: email })
        if (userData) {
            if (userData.is_admin === 1) {
                if (userData.password === password) {
                    req.session.adminId=userData._id
                    // console.log(req.session.adminId)
                    res.redirect('/admin/home')
                } else {
                    res.render('login', { message: 'Invalid password' })
                }
            } else {
                res.render('login', { message: 'Admin not found' })
            }
        } else {
            res.render('login', { message: 'Admin not found' })
        }

    } catch (error) {
        console.log(error.message)
    }
}

const loadDashboard = async (req, res) => {
    try {
        const user=await User.find({})
        const order=await Order.find({}).sort({orderDate:-1}).populate('userId')
        const product=await Product.find({})
        let totalTransaction=0
        order.forEach((item)=>{
            totalTransaction+= parseFloat(item.totalAmount)
        })
        res.render('dashboard',{user,order,product,totalTransaction})
    } catch (error) {
        console.log(error.message)
    }
}

const usersList = async (req, res) => {
    try {
        const userData = await User.find({ is_admin: 0 })
        res.render('usersList', { users: userData })
    } catch (error) {
        console.log(error.message)
    }
}

const blockUser = async (req, res) => {
    try {
        const id = req.query.id
        const userData = await User.findByIdAndUpdate({ _id: id }, { $set: { is_active: false } })
        if (userData) {
            res.redirect('/admin/usersList')
        }

    } catch (error) {
        console.log(error.message)
    }
}

const unblockUser = async (req, res) => {
    try {
        const id = req.query.id
        const userData = await User.findByIdAndUpdate({ _id: id }, { $set: { is_active: true } })
        if (userData) {
            res.redirect('/admin/usersList')
        }

    } catch (error) {
        console.log(error.message)
    }
}

const loadAddProduct = async (req, res) => {
    try {
        const categoryData = await Category.find({ is_active: true })
        const brandData=await Brand.find({is_active:true})
        res.render('addproduct', { category: categoryData,brand:brandData })
    } catch (error) {
        console.log(error.message)
    }
}

// const addNewProduct = async (req, res) => {
//     try {
//         // console.log(req.body.brand);
//         // console.log(req.body.category);
//         let salePrice
//         if(req.body.discountPercentage.trim() > 0){
//              salePrice=req.body.regularPrice - (req.body.regularPrice.trim()*req.body.discountPercentage/100)
//         }else{
//             salePrice=req.body.regularPrice.trim()
//         }
//         const product = new Product({
//             title: req.body.title.trim(),
//             weight: req.body.weight.trim(),
//             color: req.body.color.trim(),
//             shape: req.body.shape.trim(),
//             brandId: req.body.brand.trim(),
//             description: req.body.description.trim(),
//             regularPrice: req.body.regularPrice.trim(),
//             // salePrice: req.body.salePrice.trim(),
//             discountPercentage:req.body.discountPercentage.trim(),
//             bestDiscount:req.body.discountPercentage.trim(),
//             salePrice: salePrice,
//             quantity: req.body.quantity.trim(),
//             categoryId: req.body.category.trim(),
//             gender: req.body.gender.trim(),
//             tags: req.body.tags.trim(),
//             image: req.files.map((file) => file.path)
//         })

//         const userData = await product.save()
//         if (userData) {
//             res.redirect('/admin/home')
//         } else {
//             console.log('Problem identified')
//             res.write('problem in addnewProduct')
//             res.end()
//         }
//     } catch (error) {
//         console.log(error.message)
//     }
// }

const addNewProduct = async (req, res) => {
    try {
        let salePrice;

        if (req.body.discountPercentage.trim() > 0) {
            salePrice = req.body.regularPrice - (req.body.regularPrice.trim() * req.body.discountPercentage / 100);
        } else {
            salePrice = req.body.regularPrice.trim();
        }

        // Use Sharp.js to resize and crop images
        const processedImages = await Promise.all(
            req.files.map(async (file) => {
                const imageBuffer = await sharp(file.path)
                    .resize({ width: 600, height: 600 }) // Resize the image to a standard size
                    .extract({ left: 0, top: 0, width: 600, height: 600 }) // Crop the image as needed
                    .jpeg({ quality: 80 }) // Adjust quality as needed
                    .toBuffer();

                return { buffer: imageBuffer };
            })
        );

        // Delay for 1 second using a promise
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Remove original images
        req.files.forEach((file) => {
            try {
                fs.unlink(file.path);
                console.log(`File ${file.path} deleted successfully`);
            } catch (error) {
                console.error('Error deleting file:', error);
            }
        });

        const productData = {
            title: req.body.title.trim(),
            weight: req.body.weight.trim(),
            color: req.body.color.trim(),
            shape: req.body.shape.trim(),
            brandId: req.body.brand.trim(),
            description: req.body.description.trim(),
            regularPrice: req.body.regularPrice.trim(),
            discountPercentage: req.body.discountPercentage.trim(),
            bestDiscount: req.body.discountPercentage.trim(),
            salePrice: salePrice,
            quantity: req.body.quantity.trim(),
            categoryId: req.body.category.trim(),
            gender: req.body.gender.trim(),
            tags: req.body.tags.trim(),
            image: processedImages.map((processedImage, index) => {
                const filename = `processed_image_${index}.jpg`;
                const filePath = path.join(__dirname, 'uploads', filename);

                fs.writeFileSync(filePath, processedImage.buffer);

                return filePath;
            }),
        };

        const product = new Product(productData);

        const savedProduct = await product.save();

        if (savedProduct) {
            res.redirect('/admin/home');
        } else {
            console.log('Error saving product');
            res.status(500).send('Error saving product');
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
};



const productsList = async (req, res) => {
    try {
        const userData = await Product.find({}).populate('brandId').populate('categoryId')
        if (userData) {

            res.render('productsList', { products: userData })
        } else {
            res.write('No products')
            res.end()
        }
    } catch (error) {
        console.log(error.message)
    }
}

const editProductList = async (req, res) => {
    try {

        const id = req.query.id
        const userData = await Product.findOne({ _id: id }).populate('brandId').populate('categoryId')
        console.log(userData)
        const brandData = await Brand.find({ is_active: true })

        const categoryData = await Category.find({ is_active: true })
        if (userData) {
            res.render('editProduct', { products: userData, category: categoryData,brand:brandData })
        }

    } catch (error) {
        console.log(error.message)
    }
}


const deleteImage = async (req, res) => {
    try {

        const productId = req.params.productId;
        const imageIndex = req.params.index;
        const product = await Product.findOne({ _id: productId })
        console.log(imageIndex);
        product.image.splice(imageIndex, 1)

        const updated = await product.save()


        if (updated) {
            return res.redirect(`/admin/editproduct/${productId}`)
        } else {
            return res.status(500).send('error')
        }


    } catch (error) {
        console.log(error.message);
        return res.status(500).send('Internal server error')
    }
};


const loadEditProductList = async (req, res) => {
    try {
        const id = req.query.id
        const product = await Product.findOne({ _id: id })
        console.log(req.files);

        // Your existing size code...
        let Newimages = []
        req.files.forEach((image) => {
            Newimages.push(
                image.path
            )
        })

        Newimages.forEach((image) => {
            product.image.push(
                image

            )
        })
        await product.save()
        let salePrice
        if(req.body.discountPercentage.trim() > 0){
             salePrice=req.body.regularPrice - (req.body.regularPrice.trim()*req.body.discountPercentage/100)
        }else{
            salePrice=req.body.regularPrice.trim()
        }

        // var userData = await Product.findByIdAndUpdate({ _id: id }, {
        //     $set: {
        //         title: req.body.title.trim(),
        //     weight: req.body.weight.trim(),
        //     color: req.body.color.trim(),
        //     shape: req.body.shape.trim(),
        //     brandId: req.body.brand.trim(),
        //     description: req.body.description.trim(),
        //     regularPrice: req.body.regularPrice.trim(),
        //     // salePrice: req.body.salePrice.trim(),
        //     discountPercentage:req.body.discountPercentage.trim(),
        //     bestDiscount:'$discountPercentage'>'catDiscountPercentage'?'$discountPercentage':'catDiscountPercentage',
        //     salePrice: salePrice,
        //     quantity: req.body.quantity.trim(),
        //     categoryId: req.body.category.trim(),
        //     gender: req.body.gender.trim(),
        //     tags: req.body.tags.trim(),


        //     }
        // })

        const categoryData=await Category.findById(product.categoryId)
        const catDiscountPercentage=categoryData.discount

        const bestDiscount = req.body.discountPercentage > catDiscountPercentage
        ? req.body.discountPercentage
        : catDiscountPercentage;
      
      // Use the calculated value in the update
      const userData = await Product.findByIdAndUpdate(
        { _id: id },
        {
          $set: {
            title: req.body.title.trim(),
            weight: req.body.weight.trim(),
            color: req.body.color.trim(),
            shape: req.body.shape.trim(),
            brandId: req.body.brand.trim(),
            description: req.body.description.trim(),
            regularPrice: req.body.regularPrice.trim(),
            discountPercentage: req.body.discountPercentage.trim(),
            bestDiscount: bestDiscount,
            salePrice: salePrice,
            quantity: req.body.quantity.trim(),
            categoryId: req.body.category.trim(),
            gender: req.body.gender.trim(),
            tags: req.body.tags.trim(),
          }
        }
      );
          

        if (userData)
            res.redirect('/admin/productsList')

    } catch (error) {
        console.log(error.message)
    }
}

const blockProductList = async (req, res) => {
    try {
        const id = req.query.productId
        const userData = await Product.findByIdAndUpdate({ _id: id }, { $set: { is_active: false } })
        if (userData) {
            res.redirect('/admin/productsList')
        } else {
            console.log('user not found or update failed')
            res.status(404).send('user not found')
        }


    } catch (error) {
        console.log(error.message)
    }
}

const unBlockProductList = async (req, res) => {
    try {
        const id = req.query.productId
        const userData = await Product.findByIdAndUpdate({ _id: id }, { $set: { is_active: true } })
        if (userData) {
            res.redirect('/admin/productsList')
        } else {
            console.log('user not found or update failed')
            res.status(404).send('user not found')
        }

    } catch (error) {
        console.log(error.message)
    }
}

const loadCategories = async (req, res) => {
    try {
        const userData = await Category.find({})
        if (userData) {
            res.render('category', { category: userData })
        }

    } catch (error) {
        console.log(error.message)
    }
}

const checkUniqueCategory = async (req, res, next) => {
    const { categoryName } = req.body;
    console.log('here is ' + categoryName)
    try {
        const existingCategory = await Category.findOne({ categoryName: categoryName });
        console.log(existingCategory);


        if (existingCategory) {

            const categoryData = await Category.find({})
            res.render('category', { message: 'Category already exists', category: categoryData })

        } else {
            next();
        }

    } catch (err) {
        return res.status(500).json({ error: 'Database error' });
    }
};

const addCategories = async (req, res) => {
    try {
        console.log('addcategoy')
        const category = new Category({
            categoryName: req.body.categoryName.trim()
        })
        const userData = await category.save()
        if (userData) {
            res.redirect('/admin/category')
        }
    } catch (error) {
        console.log(error.message)
    }
}

const blockCategory = async (req, res) => {
    try {
        const id = req.query.id
        // console.log(id)
        const userData = await Category.findByIdAndUpdate({ _id: id }, { $set: { is_active: false } })
        await Product.updateMany(
            { categoryId: id },
            { $set: { catStatus: false } }
          );
       
        if (userData) {
            res.redirect('/admin/category')
        }
    } catch (error) {
        console.log(error.message)
    }
}

const unBlockCategory = async (req, res) => {
    try {
        const id = req.query.id
        // console.log(id)
        const userData = await Category.findByIdAndUpdate({ _id: id }, { $set: { is_active: true } })
        await Product.updateMany(
            { categoryId: id },
            { $set: { catStatus: true } }
          );
        if (userData) {
            res.redirect('/admin/category')
        }
    } catch (error) {
        console.log(error.message)
    }
}

const deleteCategory = async (req, res) => {
    try {
        const id = req.query.id
        const userData = await Category.deleteOne({ _id: id })
        if (userData) {
            res.redirect('/admin/category')
        }
    } catch (error) {
        console.log(error.message)
    }
}

const editCategory = async (req, res) => {
    try {
        const id = req.query.id
        const userData = await Category.findById({ _id: id })
        if (userData) {
            res.render('editCategory', { category: userData })
        }
    } catch (error) {
        console.log(error.message)
    }
}

const loadEditCategory = async (req, res) => {
    try {
        const id = req.query.id
        console.log('hai')
        console.log(id)
        const userData = await Category.findByIdAndUpdate({ _id: id },{$set:{categoryName:req.body.categoryName}})
        await userData.save()
        if (userData) {
            res.redirect('/admin/category')
        }
    } catch (error) {
        console.log(error.message)
    }
}

const ordersList = async (req, res) => {
    try {
        const orderData = await Order.find({}).populate('userId').sort({orderDate:-1})
        // console.log(orderData)
        if (orderData) {
            res.render('ordersList', { order: orderData })

        } else {
            res.write('no orders')
            res.end()
        }

    } catch (error) {
        console.log(error.message)
    }
}

const orderDetails = async (req, res) => {
    try {

        const orderId = req.query.orderId
        const orderData = await Order.findOne({ _id: orderId }).populate('products.productId').populate('userId')
        // console.log(orderData.products[0].productId.image[0]);
        res.render('orderDetails', { order: orderData })
    } catch (error) {
        console.log(error.message)
    }
}

const updateOrderStatus = async (req, res) => {
    try {
        const orderId = req.query.orderId
        const newStatus = req.body.status
        const orderData = await Order.findOne({ _id: orderId })
        if(newStatus=='Delivered'){
            orderData.paymentStatus='Success'
            await orderData.save()
        }
        orderData.orderstatus = newStatus
        await orderData.save()
        res.redirect('/admin/orderDetails?orderId=' + orderId);

    } catch (error) {
        console.log(error.message)
    }
}

const loadBrands = async (req, res) => {
    try {
        const userData = await Brand.find({})
        if (userData) {
            res.render('brand', { brand: userData })
        }

    } catch (error) {
        console.log(error.message)
    }
}

const checkUniqueBrand = async (req, res, next) => {
    const { brandName } = req.body;
    // console.log('here is ' + categoryName)
    try {
        const existingBrand = await Brand.findOne({ brandName: brandName });
        // console.log(existingCategory);


        if (existingBrand) {

            const brandData = await Brand.find({})
            res.render('brand', { message: 'Brand already exists', brand: brandData })

        } else {
            next();
        }

    } catch (err) {
        return res.status(500).json({ error: 'Database error' });
    }
};

const addBrand = async (req, res) => {
    try {
        const brand = new Brand({
            brandName: req.body.brandName.trim()
        })
        const userData = await brand.save()
        if (userData) {
            res.redirect('/admin/brand')
        }
    } catch (error) {
        console.log(error.message)
    }
}

const blockBrand = async (req, res) => {
    try {
        const id = req.query.id
        // console.log(id)
        const userData = await Brand.findByIdAndUpdate({ _id: id }, { $set: { is_active: false } })
        if (userData) {
            res.redirect('/admin/brand')
        }
    } catch (error) {
        console.log(error.message)
    }
}

const unBlockBrand = async (req, res) => {
    try {
        const id = req.query.id
        // console.log(id)
        const userData = await Brand.findByIdAndUpdate({ _id: id }, { $set: { is_active: true } })
        if (userData) {
            res.redirect('/admin/brand')
        }
    } catch (error) {
        console.log(error.message)
    }
}

const deleteBrand = async (req, res) => {
    try {
        const id = req.query.id
        const userData = await Brand.deleteOne({ _id: id })
        if (userData) {
            res.redirect('/admin/brand')
        }
    } catch (error) {
        console.log(error.message)
    }
}

const editBrand = async (req, res) => {
    try {
        const id = req.query.id
        const userData = await Brand.findById({ _id: id })
        console.log(userData);
        if (userData) {
            res.render('editBrand', { brand: userData })
        }
    } catch (error) {
        console.log(error.message)
    }
}

const loadEditBrand = async (req, res) => {
    try {
        const id = req.query.id
        const userData = await Brand.findByIdAndUpdate({ _id: id },{$set:{brandName:req.body.brandName}})
        await userData.save()
        if (userData) {
            res.redirect('/admin/brand')
        }
    } catch (error) {
        console.log(error.message)
    }
}


const salesReport=async(req,res)=>{
    try{
        
        if(req.query.startDate && req.query.endDate){
            const orderData=await Order.find({ orderDate: {
                $gte: req.query.startDate,
                $lte: req.query.endDate
              }}).populate('userId').sort({ orderDate: -1 })
              let totalTransaction=0
              let totalOrders=0
              let userData=await User.find({ date: {
                $gte: req.query.startDate,
                $lte: req.query.endDate
              }})
              let totalCustomers=userData.length
              let onlinePayments=0
              let cashOnDelivery=0
              let orderCancelled=0

              orderData.forEach((item)=>{
                totalTransaction+= parseFloat(item.totalAmount)
                totalOrders++
                if(item.paymentMethod==='Paypal'){
                    onlinePayments++
                }else{
                    cashOnDelivery++
                }
                if(item.orderstatus=='Cancelled'){
                    orderCancelled++
                }

              })
            //   console.log(totalTransaction)
            //   console.log(totalOrders)
            //   console.log(totalCustomers)
            //   console.log(onlinePayments)
            //   console.log(cashOnDelivery)
            //   console.log(orderCancelled)

            res.render('salesReport',{orders:orderData,totalCustomers,totalOrders,totalTransaction,onlinePayments,cashOnDelivery,orderCancelled})
        }else{
            const orderData=await Order.find({}).populate('userId').sort({ orderDate: -1 })
              let totalTransaction=0
              let totalOrders=0
              let userData=await User.find({})
              let totalCustomers=userData.length
              let onlinePayments=0
              let cashOnDelivery=0
              let orderCancelled=0

              orderData.forEach((item)=>{
                totalTransaction+= parseFloat(item.totalAmount)
                totalOrders++
                if(item.paymentMethod==='Paypal'){
                    onlinePayments++
                }else{
                    cashOnDelivery++
                }
                if(item.orderstatus=='Cancelled'){
                    orderCancelled++
                }

              })
              res.render('salesReport',{orders:orderData,totalCustomers,totalOrders,totalTransaction,onlinePayments,cashOnDelivery,orderCancelled})
        }
        
        
    }catch(error){
        console.log(error.message)
    }
}

const dateFilter=async(req,res)=>{
    try{
        // console.log(req.query.startDate)
        const startDate=req.body.startDate
        const endDate=req.body.endDate
        res.redirect(`/admin/salesReport?startDate=${startDate}&endDate=${endDate}`)
    }catch(error){
        console.log(error.message)
    }
}

const logout=async(req,res)=>{
    try{
       delete req.session.adminId
       req.session.save()
       res.redirect('/admin')
    }catch(error){
        console.log(error.message)
    }
}


module.exports = {
    loadLogin,
    verifyLogin,
    loadDashboard,
    usersList,
    blockUser,
    unblockUser,
    loadAddProduct,
    addNewProduct,
    loadCategories,
    productsList,
    editProductList,
    deleteImage,
    addCategories,
    checkUniqueCategory,
    blockCategory,
    unBlockCategory,
    deleteCategory,
    editCategory,
    loadEditCategory,
    blockProductList,
    unBlockProductList,
    loadEditProductList,
    ordersList,
    orderDetails,
    updateOrderStatus,
    salesReport,
    dateFilter,
    loadBrands,
    addBrand,
    checkUniqueBrand,
    blockBrand,
    unBlockBrand,
    deleteBrand,
    editBrand,
    loadEditBrand,
    logout
}