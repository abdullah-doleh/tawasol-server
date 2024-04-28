const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const {auth} = require("../utils/index");
const router = express.Router(); // to use put , get , post , delete
const {check, validationResult} = require("express-validator");//check is used to validate req.body
const User = require("../models/User");
const Profile = require("../models/Profile");





router.post("/register",
check("name","name is requird").notEmpty(),
check("email","Please include valid email").isEmail(),
check("password","Please choose a password with at least 6 char").isLength({min:6}),//midellware function
async(req,res)=>{
    const errors= validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }
   const {name,email,password} = req.body;
   try{
    let user = await User.findOne({email});
    if(user){
        return res.status(400).json({errors:[{msg:"user already exists"}]});
    } 
    user = new User({
        name,
        email,
        password
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password,salt);
    await user.save();
    const payload={
        user:{
            id: user.id
        }
    }
    jwt.sign(payload,config.get("jwtSecret"),{expiresIn:"5 days"},(err,token)=>{
        if(err){
            throw err;
        }else{
            res.json({token});
        }
    });
   }catch(err){
    console.log(err.message);
    res.status(500).send(err.message);

   }
});


router.post("/login",
check("email","Please include valid email").isEmail(),
check("password","Please choose a password with at least 6 char").isLength({min:6}),//midellware function
async(req,res)=>{
    const errors= validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }
   const {email,password} = req.body;
   try{
    let user = await User.findOne({email});
    if(!user){
        return res.status(400).json({errors:[{msg:"invalid credintials"}]});
    } 
    const isMatch=await  bcrypt.compare(password,user.password);
    if(!isMatch){
        return res.status(400).json({errors:[{msg:"invalid Password"}]});
    }
    const payload={
        user:{
            id: user.id,
        },
    }
    jwt.sign(payload,config.get("jwtSecret")
    ,{expiresIn:"5 days"}
    ,(err,token)=>{
        if(err){
            throw err;
        }else{
            res.json({token});
        }
    });
   }catch(err){
    console.log(err.message);
    res.status(500).send(err.message);

   }
});

//takes a token and return user information
router.get("/",auth,async (req,res)=>{
    try{
        const user = await User.findById(req.user.id).select("-password"); // will be return with Password so i used select("-password") to not include passsword
        res.json(user);
    }catch(err){
        consol.error(err.message);
        res.status(500).send(err.message)
    }
});

router.delete("/",auth,async(req,res)=>{
    try{
        const profile = await Profile.findById({
            user: req.user.id
        });
        if(profile){
            profile.deleteOne();
        }

    }catch(err){
        consol.error(err.message);
        res.status(500).send(err.message);
    }
});

module.exports = router;