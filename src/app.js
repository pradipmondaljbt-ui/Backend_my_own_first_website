import express from 'express';
import cors from 'cors'
import cookieParser from 'cookie-parser';


const app=express();
app.use(express.json({limit:'16kb'}));
app.use(express.urlencoded({extended:true, limit:'16kb'}))
app.use(express.static("public"))
app.use(cookieParser());
app.use(cors());

// router define
import UserRoute from "./routes/user.routes.js"
app.use('/api/v1/users',UserRoute);




export {app}