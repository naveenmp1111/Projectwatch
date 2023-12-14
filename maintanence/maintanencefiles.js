<script>
            function sweet(productId) {
                Swal.fire({
                    title: "Are you sure?",
                    text: "You want to block Category!",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#3085d6",
                    cancelButtonColor: "#d33",
                    confirmButtonText: "Yes, Block Category!"
                }).then((result) => {
                    if (result.isConfirmed) {
                        Swal.fire({
                            title: "Blocked!",
                            text: "Category has been blocked.",
                            icon: "success"
                        }).then((res) => {
                            if (res.isConfirmed) {
                                // Redirect after the second confirmation
                                window.location.href = `blockProductList?productId=${productId}&act=0`;
                            }
                        });
                    }
                });
            }
        </script> 

Swal.fire({
    icon: "error",
    title: "Oops...",
    text: "Something went wrong!",
    footer: '<a href="#">Why do I have this issue?</a>'
  });

  //--------------------------------------------------------------------------

  if (wishlist) {
    const products=await Product.find({is_active:true})
    // Product is already in the wishlist, update the quantity or perform other actions.
    let productExists = false;

    for (let item of wishlist.products) {
        if (item.productId == productData._id) {
            productExists = true;
            break; // Exit the loop when a match is found
        }
    }

    if (productExists) {
        res.render('home', { user: userData, products: products, message: 'alreadyexists' });
    } else {
        wishlist.products.push({ productId: productData._id});
        const wishlistData= await wishlist.save();
        if(wishlistData){
                res.redirect('/wishlist')
        }else{
            res.write('need to handle')
            res.end()
        }
    }

    // wishlist.products.foreach(item=>{
    //     if(item.productId==productData._id){
    //        res.render('home',{user:userData,products:products,message:'alreadyexists'})
    //     }
    // })
    // } else {
    //     // Product not in the wishlist, add it.
    //     wishlist.products.push({ productId: productData._id});
    // }

   

} else {
    // Wishlist doesn't exist, create a new one.
    const wishlistData = new Wishlist({
        userId: userData._id,
        products: [{ productId: productData._id}]
    });

   const data=await wishlistData.save();
   if(data){
    res.redirect('/wishlist')
   }else{
    res.write('need to handle')
    res.end()
   }
}


// res.status(200).json({ success: true, message: "Product added to wishlist" });
} catch (error) {
console.error(error.message);
res.status(500).json({ success: false, message: "Internal Server Error" });
}
};