import { Router } from "express"
import {loginUser, logoutUser, registerUser,refreshAccessToken, changeCurrentPassword, getCurrentuser, updateAccountDetails, avaratImageUpdate, coverImageUpdate, getUserChannelProfile, getWatchHistory} from "../controllers/user.controller.js"
import {upload} from "../middlewares/multer.middleewae.js"
import { verifyJwt } from "../middlewares/auth.middlewares.js";
const router=Router();

router.route('/register').post(
    upload.fields([
        {
        name:"avatar",
        maxCount:1
        },
        {
        name:"coverImage",
        maxCount:1
        }
    ]),
    registerUser);

router.route('/login').post(loginUser)

router.route('/logout').post(verifyJwt,logoutUser)

router.route('/refresh-token').post(refreshAccessToken)

router.route("/change-password").post(verifyJwt,changeCurrentPassword)

router.route("/current-user").get(verifyJwt,getCurrentuser)

router.route("/update-details").patch(verifyJwt,updateAccountDetails)

router.route("/avatar").patch(verifyJwt,upload.single("avatar"),avaratImageUpdate)

router.route("/cover-image").patch(verifyJwt,upload.single("coverImage"),coverImageUpdate)

router.route("/c/:username").get(verifyJwt,getUserChannelProfile)

router.route("/history").get(verifyJwt,getWatchHistory)




export default router;