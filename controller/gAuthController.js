import axios from 'axios';
import base64Url from 'base64url';
import fs from 'fs';
import {
  filterOutEmails,
  getMessages,
  getUserDetails,
  setCredentials,
} from '../utils/helpers.js';
import { gmail, oauth2Client } from '../config/googleApis.js';
import emailCollection from '../models/mailExtractedSchema.js';
import dotenv from 'dotenv';
dotenv.config();
export const verifyAccess = async (req, res) => {
  try {
    const accessToken = req.headers.authorization;
    const response = await axios.get(
      `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${accessToken}`
    );
    req.user = response.data;
    return res.status(200).json({ message: 'Token verified' });
  } catch (error) {
    return res.status(401).json({ message: 'Invalid access token' });
  }
};

export const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const response = await axios.post('https://oauth2.googleapis.com/token', {
      refresh_token: refreshToken,
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      grant_type: 'refresh_token',
    });
    return res.status(200).json({ accessToken: response.data.access_token });
  } catch (error) {
    return res.status(400).json({ message: 'Failed to refresh token' });
  }
};

export const getUser = async (req, res) => {
  try {
    const accessToken = req.headers.authorization;
    oauth2Client.setCredentials({ access_token: accessToken });
    const response = await gmail.users.getProfile({
      userId: 'me',
    });
    const user = await emailCollection.findOne({
      email: response.data.emailAddress,
    });
    if (!user) {
      await emailCollection.insertMany([
        {
          email: response.data.emailAddress,
          messagesTotal: response.data.messagesTotal-50,
        },
      ]);
    }
    return res
      .status(200)
      .json({ data: { email: response.data.emailAddress } });
  } catch (error) {
    return res
      .status(400)
      .json({ data: { message: 'Failed to fetch user profile' } });
  }
};

export const getEmails = async (req, res) => {
  try {
    const accessToken = req.headers.authorization;
    oauth2Client.setCredentials({ access_token: accessToken });
    const response = await gmail.users.messages.list({
      userId: 'me',
    });

    return res.status(200).json({ messages: response.data.messages });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: 'Failed to fetch emails' });
  }
};

export const getLastAttachment = async (req, res) => {
  try {
    const accessToken = req.headers.authorization;
    oauth2Client.setCredentials({ access_token: accessToken });
    const messages = await gmail.users.messages.list({
      userId: 'me',
    });
    const msg = await gmail.users.messages.get({
      userId: 'me',
      id: messages.data.messages[0].id,
    });

    if (msg.data?.payload?.parts[1]?.body?.attachmentId) {
      const attachment = await gmail.users.messages.attachments.get({
        userId: 'me',
        messageId: msg.data.id,
        id: msg.data.payload.parts[1].body.attachmentId,
      });

      if (attachment && attachment.data) {
        const data = attachment.data.data;
        const decodedData = base64Url.toBuffer(data);

        // Save the attachment to a file
        const fileName = 'Image' + Date.now() + '.jpg';
        fs.writeFileSync(`./attachmentsDownloaded/${fileName}`, decodedData);

        console.log('Attachment downloaded successfully.');
      }
    } else res.status(200).json({ messages: 'No attachment for last email' });
    return res
      .status(200)
      .json({ messages: 'Attachment downloaded successfully' });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: 'Failed to fetch last attachment' });
  }
};

export const subScribeToWebHook = async (req, res) => {
  try {
    const accessToken = req.headers.authorization;
    oauth2Client.setCredentials({ access_token: accessToken });
    const response = await gmail.users.watch({
      userId: 'me',
      requestBody: {
        labelIds: ['INBOX'], // Labels to watch for changes
        topicName: process.env.TOPIC_NAME,
        labelFilterAction: 'include',
      },
    });
    return res
      .status(200)
      .json({ messages: 'Subscribed to watchmode', response });
  } catch (error) {
    console.log(error);
    return res.status(200).json({ messages: 'Cannot Subscribe' });
  }
};

export const savePitchDeck = (req, res) => {};

export const analyseLastEmail = async (req, res) => {
  try {
    const accessToken = req.headers.authorization;
    setCredentials(accessToken);
    const { emailAddress, messagesTotal } = await getUserDetails();
    let filteredEmails = await emailCollection.findOne({
      email: emailAddress,
    });
    const messages = await getMessages();
    const emailList = [];
    for (
      let i = messagesTotal - filteredEmails.messagesTotal - 1;
      i >= 0;
      i--
    ) {
      const email = await filterOutEmails(messages[i].id, emailAddress);
      if (email) {
        emailList.push(email);
        console.log(`Email(${messages[i].id})-->Attached a pitchdeck`);
      } else {
        console.log(`Email(${messages[i].id})-->Does not contain a pitchdeck`);
      }
    }
    filteredEmails = await emailCollection.findOneAndUpdate(
      { email: emailAddress },
      {
        $push: { recievedEmails: { $each: emailList } },
        $set: { messagesTotal },
      },
      { returnDocument: 'after' }
    );

    return res.status(200).json({ data: filteredEmails.recievedEmails });
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      data: {
        message: 'Error on fetching the emails',
      },
    });
  }
};
