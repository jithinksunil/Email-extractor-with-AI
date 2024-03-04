import userCollection from '../models/userSchema.js'
import passwordCollection from '../models/passwordShema.js'
export const findUser=async(email)=>
    userCollection.findOne({email})
export const checkUserExist=async(email)=>
    userCollection.findOne({email})
export const addUser=async(body)=>
    userCollection.insertMany([body])
export const findPassword=async(password)=>
    passwordCollection.findOne({password})
export const addPasswordToUserAndPasswordCollection=async(userId,password)=>{
    await userCollection.updateOne({_id:userId},{$push:{genaratedPasswords:password}})
    await passwordCollection.insertMany([{password}])
}
