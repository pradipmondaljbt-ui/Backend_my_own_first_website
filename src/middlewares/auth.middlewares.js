import { ApiError } from "../utils/ApiError.js";
import { asyncHandaler } from "../utils/asyncHandaler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";
export const verifyJwt=asyncHandaler(async(req,res,next)=>{

    const token=req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")

    if(!token){
        throw new ApiError(400,"Unauthorized request")
    }

    const decodeToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    console.log("decoded:", decodeToken);


    const user=await User.findById(decodeToken._id)

    if(!user){
        throw new ApiError(401,"Invalid access token")
    }

    req.user=user;
    next()
    
})