import mongoose, {Schema} from "mongoose"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
const userSchema=new Schema(
    {
        username:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
            index:true
        },
        email:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
        },
        fullname:{
            type:String,
            required:true,
            index:true,
            trim:true,
        },
        avatar:{
            type:String,     //cloudinary url
            required:true, 
        },
        coverImage:{
            type:String,
        },
        watchHistory:
        [
            {
            type:Schema.Types.ObjectId,
            ref:"video"
            },
        ],
        password:{
            type:String,
            required:[true,"password is required"],
        },
        refreshToken:{
            type:String,
        },


    },
    {
        timesstmps:true,
    }
)

userSchema.pre('save',async function (next){
    if(!this.isModified('password')) return next();

    this.password=await bcrypt.hash(this.password,10)
    next();
})

userSchema.models.isPasswordCheck= async function(userPassword){
    return bcrypt.compare(userPassword,this.password);
}

userSchema.models.generateAccessToken=function(){
    return jwt.sign(
                    {
                        id:this.id,
                        email:this.email,
                        username:this.username
                    },
                    process.env.ACCESS_TOKEN_SECRET,
                    {
                        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
                    }
                    )
}

userSchema.models.generateRefreshToken=function(){
    return jwt.sign(
                    {
                        id:this.id,
                    },
                    process.env.REFRESH_TOKEN_SECRET,
                    {
                        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
                    }
                    )
}



export const User= mongoose.model("User",userSchema);



// multon or cloudinary install