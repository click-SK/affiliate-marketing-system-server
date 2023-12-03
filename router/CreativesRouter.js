import { Router } from "express";
import * as CreativesController from '../controller/CreativesController.js';
import checkAdmin from "../utils/checkAdmin.js";
import checkAuth from "../utils/checkAuth.js";
const router = new Router();

router.post('/create-creatives',CreativesController.createCreatives);
router.patch('/update-iamges-content',checkAdmin,CreativesController.updateImagesContent);
router.patch('/update-videos-content',checkAdmin,CreativesController.updateVideosContent);
router.get('/get-all-media-content',checkAuth,CreativesController.getImagesAndVideosContent);

export default router;