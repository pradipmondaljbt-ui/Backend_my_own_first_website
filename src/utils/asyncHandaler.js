// it is use when one function may use multiple folder or file
// using promise
// const asyncHandaler=(requestHandaler)=>{
//     (req,res,next)=>{
//         Promise.resolve(requestHandaler(req,res,next)).catch((err)=>next(err))
//     }
// }



// using try catch

const asyncHandaler=(requestHandaler)=>{ return async(req,res,next)=>{
    try{
        await requestHandaler(req,res,next)
    }catch(err){
        res.status(err.code || 500).json({
            success:false,
            message:err.message
        })
    }
}}

export {asyncHandaler}