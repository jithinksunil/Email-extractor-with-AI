import OpenAI from 'openai';
import { gmail, oauth2Client } from '../config/googleApis.js';
import base64Url from 'base64url';
import fs from 'fs';
const openai = new OpenAI({
  apiKey: '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', // This is the default and can be omitted
});

export async function emailAnalyser(subject = '', body = '') {
  console.log('subject--->', subject);
  console.log('body------>', body);
  const chatCompletion = await openai.chat.completions.create({
    messages: [
      {
        role: 'system',
        content:
          'Understand what is pitchdeck of a portfolio company or a startup from internet',
      },
      {
        role: 'system',
        content:
          'I will feed the subject line and email body of an email to understand wheather a pitchdeck file is attached with the email or not',
      },
      {
        role: 'system',
        content:
          'Analyse both subject line and email body to find the presence of a pitchdeck',
      },
      {
        role: 'system',
        content:
          'Find the probability of attaching a pitchdeck with the email.',
      },
      {
        role: 'system',
        content:
          'Give the probability in a json formate like { "probability": x as number } on a scale of 1 to 100 where x is a number in between 0 and 100. Should not give a description, the json format output is mandatory. If u cannot process the probabiliy in any case give the probability as 0 in the mentioned json format',
      },
      { role: 'user', content: `Email Subject :${subject}` },
      { role: 'user', content: `Email body:${body} ` },
    ],
    model: 'gpt-3.5-turbo',
  });
  const answer = chatCompletion.choices[0].message.content;

  const percentage = await parser(answer);
  return percentage;
}

async function parser(json, nthIteration = 1) {
  if (nthIteration >= 5) return 0;
  try {
    const parsedData = JSON.parse(json);
    const percentage = parsedData.probability;
    console.log(json);
    if (typeof percentage === 'number') {
      return percentage;
    }
    const chatCompletion1 = await openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'I will give a json',
        },
        {
          role: 'system',
          content:
            'Find the probability and give the probability exactly in json format like { "probability": x as number } on a scale of 1 to 100 where x is a number in between 0 and 100',
        },
        {
          role: 'system',
          content:
            'Should not give a description, the json format output is mandatory',
        },
        { role: 'user', content: parsedData },
      ],
      model: 'gpt-3.5-turbo',
    });
    const answer1 = chatCompletion1.choices[0].message.content;

    return await parser(answer1, nthIteration + 1);
  } catch (error) {
    const chatCompletion2 = await openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'I will give a description, rephrase it.',
        },
        {
          role: 'system',
          content:
            'Understand the context and find the probability mentioned in the rephrased description',
        },
        {
          role: 'system',
          content:
            'If the descrption do not saying anything about probability consider probabity as 0',
        },
        {
          role: 'system',
          content:
            'return the probability in json format like { "probability": x as number } on a scale of 1 to 100 where x is a number in between 0 and 100',
        },
        {
          role: 'system',
          content:
            'Should not give a description, the json format output is mandatory',
        },
        { role: 'user', content: json },
      ],
      model: 'gpt-3.5-turbo',
    });
    const answer2 = chatCompletion2.choices[0].message.content;
    return await parser(answer2, nthIteration + 1);
  }
}

const findBody = (part) => {
  if (part.mimeType === 'text/plain' && part.body.size > 0) {
    return part.body.data;
  }
  let innerParts = part.parts;
  if (innerParts && innerParts.length > 0) {
    for (let i = 0; i < innerParts.length; i++) {
      return findBody(innerParts[i]);
    }
  } else return '';
};

const findSubject = (headers) => {
  for (const header of headers) {
    if (header.name === 'Subject') {
      return header.value;
    }
  }
  return '';
};

const findFromEmail = (headers) => {
  for (const header of headers) {
    if (header.name === 'From') {
      return header.value;
    }
  }
  return '';
};

export function decodeEmailBody(message) {
  const payload = message.payload;
  const encodedText = findBody(payload);
  const decodedText = Buffer.from(encodedText, 'base64').toString();
  const subject = findSubject(payload.headers);
  const fromEmail = findFromEmail(payload.headers);
  return { subject, body: decodedText, fromEmail };
}

export async function setCredentials(accessToken, refreshToken) {
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
}

export async function getUserDetails() {
  const user = await gmail.users.getProfile({
    userId: 'me',
  });
  return user.data;
}
export async function getMessages(maxResults = 100) {
  const messages = await gmail.users.messages.list({
    userId: 'me',
    maxResults,
  });
  return messages.data.messages;
}

export async function filterOutEmails(messageId, emailAddress) {
  const msg = await getMessage(messageId);
  const payload = msg.payload;
  if (!payload?.parts || !payload.parts[1]?.body?.attachmentId) return;

  const { subject, body, fromEmail } = decodeEmailBody(msg);

  if (fromEmail.includes(emailAddress)) return;

  const percentage = await emailAnalyser(subject, body);

  if (!(percentage > 60)) return;
  console.log('%>60');

  const attachments = [];
  for (let i = 1; i < payload.parts.length; i++) {
    const attachment = await getAttachment(
      payload.parts[i].body.attachmentId,
      messageId
    );
    const decodedData = base64Url.toBuffer(attachment.data);

    // Save the attachment to a file
    const oldFileName = payload.parts[i].filename;
    const splitedArray = oldFileName.split('.');
    const fileExtension = splitedArray.pop();
    const fileName = `${splitedArray.join('.')}${Date.now()}.${fileExtension}`;
    attachments.push(fileName);
    fs.writeFileSync(`./attachmentsDownloaded/${fileName}`, decodedData);
    console.log('Attachment saved');
  }
  return { subject, body, attachments, from: fromEmail };
}

export async function getMessage(id) {
  const msg = await gmail.users.messages.get({
    userId: 'me',
    id,
  });
  return msg.data;
}

export async function getAttachment(id, messageId) {
  const attachment = await gmail.users.messages.attachments.get({
    userId: 'me',
    messageId,
    id,
  });
  return attachment?.data;
}