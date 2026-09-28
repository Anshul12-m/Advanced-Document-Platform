const bcrypt = require('bcrypt');
const {dbCon} = require('../config/db');
const generateToken = require('../utils/jwt');

const register = async(req,res,next)=>{
    try{
        const {name,email,password} = req.body

        if(!name ||!email||!password){
            return res.status(400).json({
                success:false,
                message:"Name,email,password are required"
            });
        }
        if(password.length < 6){
            return res.status(400).json({
                success:false,
                message:"Password must be atleast 6 characters"
            });
        }
        const [existingUsers] = await dbCon.execute(
            "select * from users where email = ?",[email]
        );
        if(existingUsers.length > 0){
            return res.status(409).json({
                success:false,
                message:"Email already registered"
            });
        }
        const passwordHash = await bcrypt.hash(password,12);

        const [result] = await dbCon.execute(
            `insert into users(name,email,password_hash) values (?,?,?)`,[name,email,passwordHash]
        );

        return res.status(201).json({
            success:true,
            message:"User registered successfully",
            user: {
            id:result.insertId,
            name,
            email}
        })
    } catch(error){
        next(error)
    }
};

const login = async (req,res,next)=>{
    try{
        const {email,password} = req.body || {};
        if(!email ||!password){
            return res.status(400).json({
                success:false,
                message:"Email and Password are required"
            });
        }
        const [users] = await dbCon.execute(
            `select id,name,email,password_hash from users where email = ?`,[email]
        );
        if(users.length ===0){
            return res.status(401).json({
                success:false,
                message:"Invalid email or password"
            })
        }
        const user = users[0];
        //compare password
        const passwordMatch = await bcrypt.compare(
            password,
            user.password_hash
        );
        if(!passwordMatch){
            return res.status(401).json({
                success:false,
                message:"invalid email or password"
            });
        }

        //Generate jwt  
        const token = generateToken(user);
        return res.status(200).json({
            success:true,
            message:"Login successful",
            accessToken:token,
            user:{
                id:user.id,
                name:user.name,
                email:user.email
            }
    });
    }
    catch(error){
        next(error);
    }
}

module.exports = {register,login}