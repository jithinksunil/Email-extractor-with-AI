import jwt from "jsonwebtoken";
import { addUser, checkUserExist, findUser } from "../dBRepository/queries.js";

export const signup = async(req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;
    const userExist =await checkUserExist(email);
    if (userExist)
      return res.status(400).json({ message: "User already exist" });
    if (password === confirmPassword) {
      await addUser({ email, password });
      return res.status(200).json({ message: "Sign up successfull" });
    }
    return res.status(400).json({ message: "Passwords does not matches" });
  } catch (error) {
    res.status(500).json({ message: "Database facing issues" });
  }
};
export const login = async(req, res) => {
  try {
    const { email, password } = req.body;
    let user =await findUser(email);
    user = user?.toObject();
    if (user) {
      if (user.password == password) {
        const accessToken = jwt.sign(user, "userPassword");
        return res
          .status(200)
          .json({ message: "Login successfull", accessToken, user });
      }
      return res.status(400).json({ message: "Wrong credentials" });
    }
    return res.status(400).json({ message: "User does not exist" });
  } catch (err) {
    return res.status(400).json({ message: "Database facing issues" });
  }
};
