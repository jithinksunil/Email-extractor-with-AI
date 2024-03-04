import jwt from "jsonwebtoken";
const checkToken = (req, res,next) => {
  const accessToken =req.headers.authorization||''
  
   jwt.verify(accessToken,'userPassword',(err, decoded) => {
    if (err) 
      return res.status(500).json({ message: "Verification failed" })
    req.userId=decoded._id
    next()
  });
};
export default checkToken
