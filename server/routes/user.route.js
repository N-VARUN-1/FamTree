import express from 'express';
import { signup, signin, fetchUser, google } from '../controllers/auth.controller.js';
import { addNode, bdayNotification, getFamilyTree, updateFamilyTree } from '../controllers/familytree.controller.js';
import multer from 'multer';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '/uploads/'); // Ensure this directory exists
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // Append timestamp to filename
    }
});

const upload = multer({ storage });

const router = express.Router();

router.post('/signin', signin);
router.post('/signup', signup);
router.post('/auth/google', google);
router.get('/fetchUser/:email', fetchUser);
router.post('/add-family-tree', upload.single('photo'), addNode);
router.get('/family-tree/:userId', getFamilyTree);
router.put('/update-family-member', updateFamilyTree);

router.post('/bday-notification-email', bdayNotification);
export default router;

