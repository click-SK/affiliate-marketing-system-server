import { Router } from "express";
import * as AdminStatisticController from '../controller/AdminStatisticController.js';
import checkAdmin from "../utils/checkAdmin.js";
import multer from 'multer';
import fs from "fs"

const router = new Router();

const storage = multer.diskStorage({
    destination: (_,__,cd) => {
        if(!fs.existsSync('uploads')) {
            fs.mkdirSync('uploads');
        }
        cd(null,'uploads')
    },
    filename: (_,file,cd) => {
        cd(null, file.originalname)
    },
})

const uploads = multer({storage})

router.post('/create-admin-statistic',AdminStatisticController.createAdminStatistic);
router.get('/get-admin-statistic',checkAdmin,AdminStatisticController.getAdminStatistic);
router.get('/get-user-statistic/:id',checkAdmin,AdminStatisticController.getOneUserForAdmin);
// router.post('/create-image-storage',AdminStatisticController.createImageStorage);
// router.patch('/upload-big-baner',uploads.single('BigBanner'),AdminStatisticController.UploadBigBaner);
// router.patch('/upload-middle-baner',uploads.single('MiddleBanner'),AdminStatisticController.UploadMiddleBaner);
// router.patch('/upload-small-baner',uploads.single('SmallBanner'),AdminStatisticController.UploadSmallBaner);

export default router;