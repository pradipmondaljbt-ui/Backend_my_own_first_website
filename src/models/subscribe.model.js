import mongoose from "mongoose";

const subscribeSchema=new mongoose.Schema({
    subscriber:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    chanel:{
         type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
})

export const Subscribe=new mongoose.model("Subscribe",subscribeSchema)