const isLogin = async(req,res,next)=>{
    try{
        if(req.session.adminId){
            // console.log(req.session.email)
            next()
        }
        else{
            console.log('no sessin for isLogin')
            res.redirect('/')
        }
        
    }catch(error){
        console.log(error.message)
    }
}

const isLogout=async(req,res,next)=>{
    try{
        if(req.session.adminId){
            // console.log(req.session.email)
            res.redirect('/admin/home')
        }else{
            console.log('no session for isLogout')
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