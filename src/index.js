
import dotenv from "dotenv";
import connectedDb from "./db/index.js";
import { app } from "./app.js";
dotenv.config({
    path:'./.env'
})
connectedDb()
.then(()=>{
    app.listen(process.env.PORT || 3000,()=>{
        console.log(`Server listen at port ${PORT}`)
    })
}).catch(error){
    console.log(`server connection failed`,error);
    throw error;
}

















/*;(async()=>{
    try{
     await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
     
     app.on('error',()=>{
        console.log('Error',error);
        throw error
     })

     app.listen(process.env.PORT,()=>{
        console.log(`App is listening on port ${PORT}`)
     })

    }catch(err){
        console.log(err)
        throw err
    }
})()*/


