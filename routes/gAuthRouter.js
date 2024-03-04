import express from 'express';
import {
  refresh,
  verifyAccess,
  getUser,
  getEmails,
  getLastAttachment,
  subScribeToWebHook,
  savePitchDeck,
  analyseLastEmail,
} from '../controller/gAuthController.js';
const router = express.Router();
router.get('/verify-access', verifyAccess);
router.post('/refresh', refresh);
router.get('/get-user', getUser);
router.get('/get-emails', getEmails);
router.get('/get-last-attachment', getLastAttachment);
router.get('/subscribe-watch', subScribeToWebHook);
router.get('/web-hook', savePitchDeck);
router.get('/analyse-email', analyseLastEmail);
export default router;
