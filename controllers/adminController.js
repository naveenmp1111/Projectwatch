const User = require('../models/userModel')
const Product = require('../models/productModel')
const Category = require('../models/categoryModel')
const Order = require('../models/orderModel')
const Brand = require('../models/brandModel')
const Banner =require('../models/bannerModel')
const sharp = require('sharp')
const fs = require('fs')
const path = require('path')


const loadLogin = async (req, res) => {
    try {

        // await Product.updateMany({},{$set:{catStatus:true}})
        res.render('login', { message: '' })
    } catch (error) {
        console.log(error.message)
        res.redirect('/500')
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
                    req.session.adminId = userData._id
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
        res.redirect('/500')
    }
}

const loadDashboard = async (req, res) => {
    try {
        const user = await User.find({})
        const order = await Order.find({}).sort({ orderDate: -1 }).populate('userId')
        const product = await Product.find({})
        let totalTransaction = 0
        const orderData = await Order.aggregate([
            {
                $unwind: '$products' // Unwind the products array
            },
            {
                $group: {
                    _id: { month: { $month: '$orderDate' } },
                    totalOrders: { $sum: 1 },
                    totalProducts: { $sum: '$products.quantity' },
                }
            },
            {
                $sort: {
                    '_id.month': 1 // Sort by month
                }
            }
        ]);

        const userData = await User.aggregate([
            {
                $group: {
                    _id: { $month: '$date' },
                    totalRegister: { $sum: 1 },
                }
            },
            {
                $sort: {
                    '_id': 1 // Sort by month
                }
            }
        ]);

        const orderStats = await Order.aggregate([
            {
                $unwind: '$products'
            },
            {
                $lookup: {
                    from: 'products',
                    localField: 'products.productId',
                    foreignField: '_id',
                    as: 'productInfo'
                }
            },
            {
                $unwind: '$productInfo'
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'productInfo.categoryId',
                    foreignField: '_id',
                    as: 'categoryInfo'
                }
            },
            {
                $group: {
                    _id: '$categoryInfo._id',
                    categoryName: { $first: '$categoryInfo.categoryName' },
                    orderCount: { $sum: 1 }
                }
            }
        ]);

        const categoryNames = JSON.stringify(orderStats.map(stat => stat.categoryName).flat());
        const orderCounts = JSON.stringify(orderStats.map(stat => stat.orderCount));

        // console.log(categoryNames)
        // console.log(orderCounts)

        const monthlyData = Array.from({ length: 12 }, (_, index) => {
            const monthOrderData = orderData.find(item => item._id.month === index + 1) || { totalOrders: 0, totalProducts: 0 };
            const monthUserData = userData.find(item => item._id === index + 1) || { totalRegister: 0 };
            return {
                totalOrders: monthOrderData.totalOrders,
                totalProducts: monthOrderData.totalProducts,
                totalRegister: monthUserData.totalRegister
            };

        });

        const totalOrdersJson = JSON.stringify(monthlyData.map(item => item.totalOrders));
        const totalProductsJson = JSON.stringify(monthlyData.map(item => item.totalProducts));
        const totalRegisterJson = JSON.stringify(monthlyData.map(item => item.totalRegister));

        order.forEach((item) => {
            if (item.totalAmount !== undefined && item.totalAmount !== null) {
                totalTransaction += parseFloat(item.totalAmount);
            }
        });



        // console.log(totalTransaction)
        res.render('dashboard', {
            user, order, product, totalTransaction, totalRegisterJson,
            totalOrdersJson, totalProductsJson, categoryNames, orderCounts
        })
    } catch (error) {
        console.log(error.message)
        res.redirect('/500')
    }
}

const usersList = async (req, res) => {
    try {
        const userData = await User.find({ is_admin: 0 })
        res.render('usersList', { users: userData })
    } catch (error) {
        console.log(error.message)
        res.redirect('/500')
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
        res.redirect('/500')
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
        res.redirect('/500')
    }
}

const loadAddProduct = async (req, res) => {
    try {
        const categoryData = await Category.find({ is_active: true })
        const brandData = await Brand.find({ is_active: true })
        res.render('addproduct', { category: categoryData, brand: brandData })
    } catch (error) {
        console.log(error.message)
        res.redirect('/500')
    }
}


const addNewProduct = async (req, res) => {
    try {
        let salePrice;
        if (req.body.discountPercentage.trim() > 0) {
            salePrice = req.body.regularPrice - (req.body.regularPrice.trim() * req.body.discountPercentage / 100);
        } else {
            salePrice = req.body.regularPrice.trim();
        }

        const imagePromises = req.files.map(async (file) => {
            const imagePath = `uploads/${file.filename}`;
            const resizedImagePath = `uploads/resized_${file.filename}`;
            await sharp(imagePath)
                .resize({ width: 572, height: 572 })
                .toFile(resizedImagePath);

            // Remove the original uploaded image
            // fs.unlinkSync(imagePath);
            // fse.remove(imagePath, (err) => {
            //     if (err) {
            //       console.error(err);
            //     } else {
            //       console.log('File deleted successfully');
            //     }
            //   });

            return resizedImagePath;
        });

        const resizedImageUrls = await Promise.all(imagePromises);



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
            discountPrice: salePrice,
            salePrice: salePrice,
            quantity: req.body.quantity.trim(),
            categoryId: req.body.category.trim(),
            gender: req.body.gender.trim(),
            tags: req.body.tags.trim(),
            image: resizedImageUrls,
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
        res.redirect('/500')
        // res.status(500).send('Internal Server Error');
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
        res.redirect('/500')
    }
}

const editProductList = async (req, res) => {
    try {

        const id = req.query.id
        const userData = await Product.findOne({ _id: id }).populate('brandId').populate('categoryId')
        // console.log(userData)
        const brandData = await Brand.find({ is_active: true })

        const categoryData = await Category.find({ is_active: true })
        if (userData) {
            res.render('editProduct', { products: userData, category: categoryData, brand: brandData })
        }

    } catch (error) {
        console.log(error.message)
        res.redirect('/500')
    }
}


const deleteImage = async (req, res) => {
    try {

        const productId = req.params.productId;
        const imageIndex = req.params.index;
        const product = await Product.findOne({ _id: productId })
        // console.log(imageIndex);
        product.image.splice(imageIndex, 1)

        const updated = await product.save()


        if (updated) {
            return res.redirect(`/admin/editproduct/${productId}`)
        } else {
            return res.status(500).send('error')
        }


    } catch (error) {
        console.log(error.message);
        res.redirect('/500')
        // return res.status(500).send('Internal server error')
    }
};


const loadEditProductList = async (req, res) => {
    try {
        const id = req.query.id
        const product = await Product.findOne({ _id: id })
        // console.log(req.files);
        let Newimages = []
        await Promise.all(req.files.map(async (file) => {
            const imagePath = `uploads/${file.filename}`;
            const resizedImagePath = `uploads/resized_${file.filename}`;

            // Resize the image
            await sharp(imagePath)
                .resize({ width: 572, height: 572 })
                .toFile(resizedImagePath);

            Newimages.push(resizedImagePath);
        }));
        Newimages.forEach((image) => {
            product.image.push(image);
        });

        // Save the product
        await product.save();
        let salePrice
        if (req.body.discountPercentage.trim() > 0) {
            salePrice = req.body.regularPrice - (req.body.regularPrice.trim() * req.body.discountPercentage / 100)
        } else {
            salePrice = req.body.regularPrice.trim()
        }

        const categoryData = await Category.findById(product.categoryId)
        const catDiscountPercentage = categoryData.discount

        const bestDiscount = req.body.discountPercentage > catDiscountPercentage
            ? req.body.discountPercentage
            : catDiscountPercentage;

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
        res.redirect('/500')
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
        res.redirect('/500')
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
        res.redirect('/500')
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
        res.redirect('/500')
    }
}

const checkUniqueCategory = async (req, res, next) => {
    const { categoryName } = req.body;
    // console.log('here is ' + categoryName)
    try {
        const existingCategory = await Category.findOne({ categoryName: categoryName });
        // console.log(existingCategory);
        if (existingCategory) {
            const categoryData = await Category.find({})
            res.render('category', { message: 'Category already exists', category: categoryData })
        } else {
            next();
        }
    } catch (err) {
        console.log(err.message)
        res.redirect('/500')
        // return res.status(500).json({ error: 'Database error' });
    }
};

const addCategories = async (req, res) => {
    try {
        const category = new Category({
            categoryName: req.body.categoryName.trim()
        })
        const userData = await category.save()
        if (userData) {
            res.redirect('/admin/category')
        }
    } catch (error) {
        console.log(error.message)
        res.redirect('/500')
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
        res.redirect('/500')
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
        res.redirect('/500')
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
        res.redirect('/500')
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
        res.redirect('/500')
    }
}

const loadEditCategory = async (req, res) => {
    try {
        const id = req.query.id
        const userData = await Category.findByIdAndUpdate({ _id: id }, { $set: { categoryName: req.body.categoryName } })
        await userData.save()
        if (userData) {
            res.redirect('/admin/category')
        }
    } catch (error) {
        console.log(error.message)
        res.redirect('/500')
    }
}

const ordersList = async (req, res) => {
    try {
        const orderData = await Order.find({}).sort({ orderDate: -1 }).populate('userId')
        // console.log(orderData)
        if (orderData) {
            res.render('ordersList', { order: orderData })

        } else {
            res.write('no orders')
            res.end()
        }

    } catch (error) {
        console.log(error.message)
        res.redirect('/500')
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
        res.redirect('/500')
    }
}

const updateOrderStatus = async (req, res) => {
    try {
        const orderId = req.query.orderId
        const newStatus = req.body.status
        const orderData = await Order.findOne({ _id: orderId })
        if (newStatus == 'Delivered') {
            orderData.paymentStatus = 'Success'
            await orderData.save()
        }
        orderData.orderstatus = newStatus
        await orderData.save()
        res.redirect('/admin/orderDetails?orderId=' + orderId);

    } catch (error) {
        console.log(error.message)
        res.redirect('/500')
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
        res.redirect('/500')
    }
}

const checkUniqueBrand = async (req, res, next) => {
    const { brandName } = req.body;
    try {
        const existingBrand = await Brand.findOne({ brandName: brandName });
        if (existingBrand) {

            const brandData = await Brand.find({})
            res.render('brand', { message: 'Brand already exists', brand: brandData })

        } else {
            next();
        }

    } catch (err) {
        console.log(err.message)
        res.redirect('/500')
        // return res.status(500).json({ error: 'Database error' });
    }
};

const addBrand = async (req, res) => {
    try {
       const imagePromises = req.files.map(async (file) => {
            const imagePath = `uploads/${file.filename}`;
            //code for sharp if needed from the add banner
            return imagePath
        });

        const resizedImageUrls = await Promise.all(imagePromises);
        const brand = new Brand({
            brandName: req.body.brandName.trim(),
            brandImage:resizedImageUrls
        })
        const userData = await brand.save()
        if (userData) {
            res.redirect('/admin/brand')
        }
    } catch (error) {
        console.log(error.message)
        res.redirect('/500')
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
        res.redirect('/500')
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
        res.redirect('/500')
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
        res.redirect('/500')
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
        res.redirect('/500')
    }
}

const loadEditBrand = async (req, res) => {
    try {
        const id = req.query.id
        const imagePromises = req.files.map(async (file) => {
            const imagePath = `uploads/${file.filename}`;
            //code for sharp if needed from the add banner
            return imagePath
        });

        const resizedImageUrls = await Promise.all(imagePromises);
        if(resizedImageUrls.length>0){
            const userData = await Brand.findByIdAndUpdate({ _id: id }, { $set: { brandName: req.body.brandName ,brandImage:resizedImageUrls} })
            await userData.save()
        }else{
            const userData = await Brand.findByIdAndUpdate({ _id: id }, { $set: { brandName: req.body.brandName } })
            await userData.save()
        }
        
        
        
            res.redirect('/admin/brand')
        
    } catch (error) {
        console.log(error.message)
        res.redirect('/500')
    }
}


const salesReport = async (req, res) => {
    try {

        if (req.query.startDate && req.query.endDate) {
            const orderData = await Order.find({
                orderDate: {
                    $gte: req.query.startDate,
                    $lte: req.query.endDate
                }
            }).populate('userId').sort({ orderDate: -1 })
            let totalTransaction = 0
            let totalOrders = 0

            const userData = await Order.distinct('userId', {
                orderDate: {
                    $gte: req.query.startDate,
                    $lte: req.query.endDate
                }
            })
            let totalCustomers = userData.length
            let onlinePayments = 0
            let cashOnDelivery = 0
            let orderCancelled = 0


            orderData.forEach((item) => {
                if (item.totalAmount !== undefined && item.totalAmount !== null) {
                    totalTransaction += parseFloat(item.totalAmount);
                }
                totalOrders++
                if (item.paymentMethod === 'Paypal') {
                    onlinePayments++
                } else {
                    cashOnDelivery++
                }
                if (item.orderstatus == 'Cancelled') {
                    orderCancelled++
                }

            })
            //   console.log(totalTransaction) 
            //   console.log(totalOrders)
            //   console.log(totalCustomers)
            //   console.log(onlinePayments)
            //   console.log(cashOnDelivery)
            //   console.log(orderCancelled)

            res.render('salesReport', { orders: orderData, totalCustomers, totalOrders, totalTransaction, onlinePayments, cashOnDelivery, orderCancelled, start: req.query.startDate, end: req.query.endDate })
        } else {
            const orderData = await Order.find({}).populate('userId').sort({ orderDate: -1 })
            let totalTransaction = 0
            let totalOrders = 0
            const userData = await Order.distinct('userId')
            let totalCustomers = userData.length
            let onlinePayments = 0
            let cashOnDelivery = 0
            let orderCancelled = 0

            orderData.forEach((item) => {
                if (item.totalAmount !== undefined && item.totalAmount !== null) {
                    totalTransaction += parseFloat(item.totalAmount);
                }
                totalOrders++
                if (item.paymentMethod === 'Paypal') {
                    onlinePayments++
                } else {
                    cashOnDelivery++
                }
                if (item.orderstatus == 'Cancelled') {
                    orderCancelled++
                }

            })
            res.render('salesReport', { orders: orderData, totalCustomers, totalOrders, totalTransaction, onlinePayments, cashOnDelivery, orderCancelled })
        }


    } catch (error) {
        console.log(error.message)
        res.redirect('/500')
    }
}

const dateFilter = async (req, res) => {
    try {
        // console.log(req.query.startDate)
        const startDate = req.body.startDate
        const endDate = req.body.endDate
        res.redirect(`/admin/salesReport?startDate=${startDate}&endDate=${endDate}`)
    } catch (error) {
        console.log(error.message)
        res.redirect('/500')
    }
}

const bannerPage= async(req,res)=>{
    try {
        const bannerData=await Banner.find({})
        console.log(bannerData)
        res.render('banner',{banner:bannerData})
    } catch (error) {
        console.log(error.message)
    }
} 

const addBanner=async(req,res)=>{
    try {
        console.log('haiii')
        const imagePromises = req.files.map(async (file) => {
            const imagePath = `uploads/${file.filename}`;
            // const resizedImagePath = `uploads/resized_${file.filename}`;
            // await sharp(imagePath)
            //     .resize({ width: 572, height: 572 })
            //     .toFile(resizedImagePath);

            // Remove the original uploaded image
            // fs.unlinkSync(imagePath);
            // fse.remove(imagePath, (err) => {
            //     if (err) {
            //       console.error(err);
            //     } else {
            //       console.log('File deleted successfully');
            //     }
            //   });

            return imagePath
        });

        const resizedImageUrls = await Promise.all(imagePromises);
        const bannerData = new Banner({
            bannerName:req.body.bannername,
            bannerText:req.body.bannertext,
            bannerImage:resizedImageUrls
        })
         // Save the banner data to the database
         const savedBanner = await bannerData.save();

         // Send a response back to the client
         res.status(201).json({ message: 'Banner created successfully', banner: savedBanner });

    } catch (error) {
        console.log(error.message)
    }
}

const blockBanner=async(req,res)=>{
    try {
        console.log('coming here')
        const bannerId=req.query.bannerId
        await Banner.findByIdAndUpdate({_id:bannerId},{$set:{is_active:false}})
        res.redirect('/admin/banner')
    } catch (error) {
        console.log(error.message)
    }
}

const unblockBanner=async(req,res)=>{
    try {
        const bannerId=req.query.bannerId
        await Banner.findByIdAndUpdate({_id:bannerId},{$set:{is_active:true}})
        res.redirect('/admin/banner')
    } catch (error) {
        console.log(error.message)
    }
}

const editBanner=async(req,res)=>{
    try {
        console.log('yeah')
        const imagePromises = req.files.map(async (file) => {
            const imagePath = `uploads/${file.filename}`;
            //code for sharp if needed from the add banner
            return imagePath
        });

        const resizedImageUrls = await Promise.all(imagePromises);
        const bannerId= req.body.bannerId
        if(resizedImageUrls.length>0){
            const bannerData=await Banner.findByIdAndUpdate({_id:bannerId},{$set:{bannerText:req.body.bannerText,bannerImage:resizedImageUrls}})
        }else{
            const bannerData=await Banner.findByIdAndUpdate({_id:bannerId},{$set:{bannerText:req.body.bannerText}})
        }
        
       
            res.status(201).json({ message: 'Banner created successfully' });
        
    } catch (error) {
        console.log(error.message)
    }
}

const logout = async (req, res) => {
    try {
        delete req.session.adminId
        req.session.save()
        res.redirect('/admin')
    } catch (error) {
        console.log(error.message)
        res.redirect('/500')
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
    bannerPage,
    addBanner,
    blockBanner,
    unblockBanner,
    editBanner,
    logout
}