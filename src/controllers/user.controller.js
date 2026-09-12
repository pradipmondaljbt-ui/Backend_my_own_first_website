import { asyncHandaler } from "../utils/asyncHandaler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.model.js"
import {cloudinaryFileUpload} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
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

    const avatarLocalpath=req.files?.avatar[0]?.path
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

export default registerUser;