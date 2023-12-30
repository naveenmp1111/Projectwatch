const User = require('../models/userModel')
const Product = require('../models/productModel')
const Wishlist=require('../models/wishlistModel')
const Category=require('../models/categoryModel')
const Brand=require('../models/brandModel')


const addToWishlist = async (req, res) => {
    try {
        const id = req.query.id;
        const email = req.session.email;

        const userData = await User.findOne({ email: email });
        const productData = await Product.findById(id);
        const wishlist = await Wishlist.findOne({ userId: userData._id });
        const categories = await Category.find({is_active:true})

        if (wishlist) {
            // const products = await Product.find({ is_active: true });
            let productExists = false;

            for (let item of wishlist.products) {
                // console.log("item.productId:", item.productId, typeof item.productId);
                // console.log("productData._id:", productData._id, typeof productData._id);
                if (item.productId.toString() === productData._id.toString()) {
                    productExists = true;
                    break; 
                }
            }

            if (productExists) {
                res.redirect('/wishlist')
            } else {
                console.log('coming')
                wishlist.products.push({ productId: productData._id });
                const wishlistData = await wishlist.save();

                if (wishlistData) {
                    res.redirect('/wishlist');
                } else {
                    res.status(500).send('Failed to save wishlist data');
                }
            }
        } else {
            
            const products = await Product.find({ is_active: true });
            const wishlistData = new Wishlist({
                userId: userData._id,
                products: [{ productId: productData._id }]
            });

            const data = await wishlistData.save();

            if (data) {
                res.redirect('/wishlist');
            } else {
                res.status(500).send('Failed to save wishlist data');
            }
        }
    } catch (error) {
        console.error(error.message);
        res.redirect('/500')
        // res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};



const showWishlist=async(req,res)=>{
    try{
        const email=req.session.email
        const userData=await User.findOne({email})
        const wishlistData=await Wishlist.findOne({userId:userData._id}).populate('products.productId')
        console.log(wishlistData)
        const categories=await Category.find({is_active:true})
        const brands=await Brand.find({is_active:true})
        res.render('wishlist',{wishlist:wishlistData,user:userData,categories,brands})
    }catch(error){
        console.log(error.message)
        res.redirect('/500')
    }
}

const addToCart=async(req,res)=>{
    try{
        const productId=req.query.productId
        const quantity = parseInt(req.body.quantity, 10) ?? 1
        const email = req.session.email
        const cartItem = {
            productId: productId,
            quantity: 1
        }
        const userData = await User.findOne({ email: email })
 
        if (userData && userData.cart) {
            
                await User.findOneAndUpdate(
                    { email: email },
                    { $push: { cart: cartItem } },
                    // {upsert:true,new:true}
                )
                res.redirect('/cart')
        }

    }catch(error){
        console.log(error.message)
        res.redirect('/500')
    }
}


const deleteFromWishlist=async(req,res)=>{
    try{
        const productId=req.query.productId
        const email=req.session.email
        const userData=await User.findOne({email})
        const wishlistData=await Wishlist.updateOne({userId:userData._id},{$pull:{'products':{'productId':productId}}})
        if(wishlistData){
            res.redirect('/wishlist')
        }
        
    }catch(error){
        console.log(error.message)
        res.redirect('/500')
    }
}



module.exports={
    addToWishlist,
    showWishlist,
    addToCart,
    deleteFromWishlist
}