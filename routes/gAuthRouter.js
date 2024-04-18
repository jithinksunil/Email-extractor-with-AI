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
  webhook,
  subscribe,
} from '../controller/gAuthController.js';
const router = express.Router();
router.get('/webhook', webhook);
router.get('/subscribe', subscribe);
router.get('/verify-access', verifyAccess);
router.post('/refresh', refresh);
router.get('/get-user', getUser);
router.get('/get-emails', getEmails);
router.get('/get-last-attachment', getLastAttachment);
router.get('/subscribe-watch', subScribeToWebHook);
router.get('/analyse-email', analyseLastEmail);
export default router;
