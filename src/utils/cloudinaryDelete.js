import {v2 as cloudinary} from "cloudinary"

const getPublicIdFromUrl=(url)=>{

    if(!url || typeof url!=="string"){
        return null
    }

    const match=url.match(/\/upload\/(?:v\d+\/)?(.+)$/);

    if(!match){
        return null
    }

    return match[1].replace(/\.[a-zA-Z0-9]+$/, "")
}

const deleteFromCloudinary=async(url,resourceType="image")=>{

    try{
        const publicId=getPublicIdFromUrl(url)

        if(!publicId){
            console.warn("cloudinary invalid url, delete is skip",url)
            return null
        }

        const result=await cloudinary.uploader.destroy(publicId,{
            resource_type:resourceType,
            invalidate:true
        })

        if(result.result!=="ok"){
            console.warn("cloudinary not deleted the previous file(${result.result})",publicId)
            
        }
        return result;

    }catch(error){
        console.error("cloudinary delete error",error.message)
        return null
    }
    
}

export{getPublicIdFromUrl,deleteFromCloudinary}