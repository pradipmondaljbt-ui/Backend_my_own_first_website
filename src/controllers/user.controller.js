import { asyncHandaler } from "../utils/asyncHandaler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.model.js"
import {cloudinaryFileUpload} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import { verifyJwt } from "../middlewares/auth.middlewares.js";
import jwt from "jsonwebtoken"
import { deleteFromCloudinary } from "../utils/cloudinaryDelete.js";

const generateAccessTokenAndrefereshToken=async(userId)=>{
    const user= await User.findById(userId);
    const accessToken=user.generateAccessToken();
    const refreshToken=user.generateRefreshToken();

    user.refreshToken=refreshToken;
    await user.save({validateBeforeSave:false});

    return {accessToken,refreshToken}
}


const registerUser=asyncHandaler(async(req,res)=>{
    // get user details from frontend
    // validation - not empty
    // check if user alrady exist- username ,email
    // check for images, check for avator
    // upload them to cloudinary , avatar
    // creat user object - creat entry in db
    // remove password and referesh token from response
    // check for user creation
    // return response

    // frontend thaka data nilam
    const {fullname,email,password,username}=req.body;
    console.log("email:",email);

    // validation check korchi ja kono akta field empty to noi , jodi hoi tahola error throw korbo

    if(
        [fullname,email,username,password].some((field)=>
        field?.trim()===""
        )
    ){
        throw new ApiError(400,"all fields are required");
    }

    // username er email jodi aga thaka exist kore tahola errro throw korbo

    const existdUser=await User.findOne({
        $or:[{username},{email}]
    })

    if(existdUser){
        throw new ApiError(409,"User with email or username already exists");
    }

    console.log(req.files);
    // avatar er coverimage nbo multer thaka server e 

    const avatarLocalpath=req.files?.avatar?.[0]?.path
    // const coverImageLocalpath=req.files?.coverImage[0]?.path ||""
    let coverImageLocalpath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage[0].path){
        coverImageLocalpath=req.files.coverImage[0].path;
    }


    if(!avatarLocalpath){
        throw new ApiError(400,"avatar is required");
    }

    // server thaka cloudinary ta upload korbo

    const avatarCloudinary= await cloudinaryFileUpload(avatarLocalpath);
    const coverImageCloudinary=await cloudinaryFileUpload(coverImageLocalpath);
    if(!avatarCloudinary){
        throw new ApiError(400,"avatar file is required");
    }

    // db ta new object banachi
    const user=await User.create({
        fullname,
        email,
        avatar:avatarCloudinary.url,
        coverImage:coverImageCloudinary?.url || "",
        password,
        username:username.toLowerCase()
    })

    const createduser=await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createduser){
        throw new ApiError(500,"something went wrong while registering the user")
    }

    return res.status(201).json(
         new ApiResponse(200,createduser,"user register successfully")
    )

})

const loginUser=asyncHandaler(async (req,res)=>{
    /* 
    req.body=data;
    username or email 
    find the user
    password check
    access token and referesh token
    send cookie
    */

    const {username,email,password}=req.body

    if(!username && !email){
        throw new ApiError(400,"username or email is required");
    }
    const user=await User.findOne({
        $or: [{username},{email}]
    })

    if(!user){
        throw new ApiError(401,"user does not exist");
    }

    const validPassword=await user.isPasswordCheck(password);
    if(!validPassword){
        throw new ApiError(404,"password is not match");
    }

    const{accessToken,refreshToken}=await generateAccessTokenAndrefereshToken(user._id)

    const userloggedin=await User.findById(user._id).select("-password -refereshToken")

    const options={
        httpOnly:true,
        secure:true
    }

    return res.status(200).cookie("accessToken", accessToken,options)
    .cookie("refreshToken",refreshToken,options).
    json(
        new ApiResponse(
            200,
            {
                user:userloggedin,accessToken,refreshToken
            },
            `user successfully logged in`
        )
    )


})

const logoutUser=asyncHandaler(async(req,res)=>{

    await User.findByIdAndUpdate(req.user._id,
        {
            $unset:{
                refreshToken:1
            },
            
        },
        {
                new:true
            }
    )

    const options={
        httpOnly:true,
        secure:true
    }

    return res.status(200).clearCookie("accessToken",options)
    .clearCookie("refereshToken",options)
    .json(
         new ApiResponse(200,"Successfully log out")
    )
})

const refreshAccessToken=asyncHandaler(async(req,res)=>{

    const incomingRefereshToken=req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefereshToken){
        throw new ApiError(401,"unauthorized request")
    }
    

    
       try {
         const decodeToken=jwt.verify(incomingRefereshToken,REFRESH_TOKEN_SECRET)
     
         const user=await User.findById(decodeToken._id)
     
         if(!user){
             throw new ApiError(401,"Invalid RefereshToken")
         }
     
         if(incomingRefereshToken!==user.refreshToken){
             throw new ApiError(401,"Invalid refereshtoken")
         }
     
         const {accessToken,NewrefreshToken}=await generateAccessTokenAndrefereshToken(user._id)
     
         const options={
             httpOnly:true,
             secure:true
         }
     
         return res.status(200)
         .cookie("accessToken",accessToken,options)
         .cookie("refreshToken",NewrefreshToken,options)
         .json(
             new ApiResponse(
                 200,
                 {
                     accessToken,refreshToken:NewrefreshToken
                 },
                 "Accesstoken refereshed"
             )
         )
       } catch (error) {
        throw new ApiError(401,error?.message||"Invalid accessToeken")
       }
    
        })
    
const changeCurrentPassword=asyncHandaler(async(req,res)=>{
    const {oldPassword,NewPassword}=req.body;

    const user=await User.findById(req.user?._id)

    if(!user){
        throw new ApiError(400,"bad request")
    }

    const verifyPassword=await user.isPasswordCheck(oldPassword)

    if(!verifyPassword){
        throw new ApiError(401,"password does not match")
    }

    user.password=NewPassword
    await user.save({validateBeforeSave:false})

    return res.status(200).json(
        new ApiResponse(200,{},"password change successfully")
    )
})

const getCurrentuser=asyncHandaler(async(req,res)=>{


    return res.status(200).json(new ApiResponse(200,req.user,"User fetch successfully"))
})

const updateAccountDetails=asyncHandaler(async(req,res)=>{

    const {fullname,email}=req.body

    if(!fullname || !email){
        throw new ApiError(400,"All fields are required")
    }

    const user=await User.findByIdAndUpdate(req.user?._id,
        {fullname,
            email:email
        },
        {new:true}
    ).select("-password")

    return res.status(200).json(new ApiResponse(200,user,"update successfully"))


})

const coverImageUpdate=asyncHandaler(async(req,res)=>{
    const coverImageLocalPath=req.file?.path

    if(!coverImageLocalPath){
        throw new ApiError(400,"cover image file is missing")
    }

    const coverImage=await uploadOnCloudinary(coverImageLocalPath)

    const oldCoverImage=req.user.coverImage

    if(!coverImage.url){
        throw new ApiError(400,"Error while uploading on cloudinary")
    }

    const user=await User.findByIdAndUpdate(req.user?._id,
        {$set:{
            coverImage:coverImage.url
        }

        },
        {new:true}
    ).select("-password")

    await deleteFromCloudinary(oldCoverImage)

    return res.status(200).json(
        new ApiResponse(200,user,"cover image change successfully")
    )
})

const avaratImageUpdate=asyncHandaler(async(req,res)=>{

    const avatarLocalPath=req.file?.path

    if(!avatarLocalPath){
        throw new ApiError(400,"avatar path is missing")
    }

    const newavatar=await uploadOnCloudinary(avatarLocalPath)

    const oldavatar=req.user.avatar

    if(!newavatar.url){
        throw new ApiError(400,"Error on while upload cloudinay avatar file")
    }

    const user=await User.findByIdAndUpdate(req.user?._id,
        {
            $set:{
                avatar:newavatar.url
            }
        },
        {
            new:true
        }
    ).select("-password")

    await deleteFromCloudinary(oldavatar)

    return res.status(200).json(
        new ApiResponse(200,user,"avatar update successfully")
    )
    
})


const getUserChannelProfile = asyncHandaler(async(req, res) => {
    const {username} = req.params

    if (!username?.trim()) {
        throw new ApiError(400, "username is missing")
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1

            }
        }
    ])

    if (!channel?.length) {
        throw new ApiError(404, "channel does not exists")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, channel[0], "User channel fetched successfully")
    )
})

const getWatchHistory = asyncHandler(async(req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user[0].watchHistory,
            "Watch history fetched successfully"
        )
    )
})

export {
 registerUser,
 loginUser,
 logoutUser,
 refreshAccessToken,
 changeCurrentPassword,
 getCurrentuser,
 updateAccountDetails,
 coverImageUpdate,
avaratImageUpdate,
getUserChannelProfile,
getWatchHistory


};