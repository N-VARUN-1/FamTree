import express from 'express';
import { resetPass, verifyCode, forgotPass } from '../../controllers/passwords.controller.js';

const router = express.Router();

router.post('/resetPass', resetPass);
router.post('/verifyCode', verifyCode);
router.post('/forgotPass', forgotPass);

export default router;