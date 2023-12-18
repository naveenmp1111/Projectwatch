const User=require('../models/userModel')
const userController=require('../controllers/userController')


const isLogin = async(req,res,next)=>{
    try{
        if(req.session.email){
          
            next()
        }
        else{
           
            res.redirect('/')
        }
        
    }catch(error){
        console.log(error.message)
    }
}

const isLogout=async(req,res,next)=>{
    try{
        if(req.session.email){

            res.redirect('/')
        }else{
            next()
        }
        
    }catch(error){
        console.log(error.message)
    }
}
const isBlocked = async (req, res, next) => {
    try {
        
        const userData = await User.findOne({ email: req.session.email });

        if (userData && userData.is_active === false) {
            // req.session.destroy()
            delete req.session.email
            res.redirect('/login?message=blocked');
            return     
        }

        next();
    } catch (error) {
        console.log(error.message)
    }
};

module.exports={
    isLogin,
    isLogout,
    isBlocked
}