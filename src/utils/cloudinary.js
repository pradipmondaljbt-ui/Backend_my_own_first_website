import {v2 as cloudinary} from  'cloudinary'
import fs from 'fs'

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
})


// file upload on cloudinary

const cloudinaryFileUpload=async(localFile)=>{
    try{
    if(!localFile) return null;

    const response=await cloudinary.uploader.upload(localFile,{
        resource_type:"auto"
    })
    console.log("file uploaded successfully",response.url)
    return response.url
    }catch(error){
        fs.unlinkSync(localFile)
        return null
    }
}

export {cloudinaryFileUpload}