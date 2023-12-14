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


module.exports={
    isLogin,
    isLogout,
}