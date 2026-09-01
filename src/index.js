
import dotenv from "dotenv";
import connectedDb from "./db/index.js";
dotenv.config({
    path:'./.env'
})
connectedDb();
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


