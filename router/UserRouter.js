import { Router } from "express";
import * as UsersController from '../controller/UserController.js';
import checkAuth from "../utils/checkAuth.js";
import checkAdmin from "../utils/checkAdmin.js";

const router = new Router();

router.post('/register',UsersController.register);
router.post('/login',UsersController.login);
router.patch('/update-user-data',UsersController.updateData);
router.get('/get-me',checkAuth,UsersController.getMe);
router.get('/get-all-users',checkAdmin,UsersController.getAllUsers);
router.get('/search-users',checkAdmin,UsersController.searchUsers);
router.patch('/update-user-balance',checkAdmin,UsersController.updateUserBalance);
router.patch('/update-user-bonus',checkAdmin,UsersController.updateUserBonuse);
router.patch('/update-user-link',checkAuth,UsersController.updateUserLink);
router.patch('/update-user-promo-code',checkAuth,UsersController.updateUserPromotionalCode);
router.patch('/update-wallet-address',checkAuth,UsersController.updateWalletAddress);
// router.get('/download-big-banner',UsersController.dowloadBigBaner);
// router.get('/download-middle-banner',UsersController.dowloadMiddleBaner);
// router.get('/download-small-banner',UsersController.dowloadSmallBaner);
// router.get('/get-all-banners',checkAuth,UsersController.getAllBanners);
export default router;