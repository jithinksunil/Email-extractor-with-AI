import {
  addPasswordToUserAndPasswordCollection,
  findPassword,
} from "../dBRepository/queries.js";

export const genaratePassword = async (req, res) => {
  function generatePassword(constrains) {
    const { lowerCase, upperCase, specialCharacter, number, length } =
      constrains;
    const lowerCaseChars = "abcdefghijklmnopqrstuvwxyz";
    const upperCaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const specialChars = "!@#$%&";
    const numberChars = "0123456789";

    let chars = "";
    let password = "";

    if (lowerCase) chars += lowerCaseChars;
    if (upperCase) chars += upperCaseChars;
    if (specialCharacter) chars += specialChars;
    if (number) chars += numberChars;

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      password += chars.charAt(randomIndex);
    }

    return password;
  }

  let password = generatePassword(req.body); // specify the desired length

  if (password) {
    let passwordExistInDB = await findPassword(password);
    while (passwordExistInDB) {
      password = generatePassword(req.body);
      passwordExistInDB = await findPassword(password);
    }
    await addPasswordToUserAndPasswordCollection(req.userId, password);
  }
  res.status(200).json({ password:password||'Select check boxes' });
};
