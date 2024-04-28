const express = require("express");
const {auth,upload} = require("../utils/index");
const normalize = require("normalize-url");
const Profile = require("../models/Profile");
const User = require("../models/User");
const Post = require("../models/Post");

const {check, validationResult}= require("express-validator");

const router = express.Router(); // to use put , get , post , delete

router.post("/",
    auth,
    check("status","status is required").notEmpty(),
    check("skills","Skills are required").notEmpty(),
    async(req,res)=>{
        const errors= validationResult(req);
        if(!errors.isEmpty()){
            console.log(errors);
            return res.status(400).json({errors:errors.array()});
        }
        const {website,skills, youtube,twitter,instagram,linkedin,facebook,github,...rest} = req.body;

        const profile ={
            user: req.user.id,
            website: website && website !=="" ? normalize(website,{forceHttps:true}):"",
            skills: Array.isArray(skills)? skills : skills.split(",".localeCompare(skill =>skill.trim())),
            ...rest
        }
        const socialFields ={youtube,twitter,instagram,linkedin,facebook,github};

        for(let key in socialFields){
            const value = socialFields[key];
            if(value && value!=""){
                socialFields[key] = normalize(value,{forceHttps:true});
            }
        }
        profile.social = socialFields;
        try{
            let profileObject = await Profile.findOneAndUpdate(
                {
                    user:req.user.id
                },
                {$set:profile},
                {new : true, upsert : true}
            );
            return res.json(profileObject);
        }catch(err){
            console.log(err);
            console.error(err.message);
            
            return res.status(500).send(err.message);
        }
});

router.get("/me",auth,async (req,res)=>{
    try{
      const profile=  await Profile.findOne({
            user: req.user.id
        }).populate("user",["name"]); //to return speciface object from the profile schema
       if(!profile){
        return res.status(400).json({msg:"no profile for this user"});
       }
        res.json(profile);
    }catch(err){
        console.error(err.message);
        return res.status(500).send(err.message);
    }
});
router.get("/",auth,async (req,res)=>{
    try{
    const profiles=  await Profile.find().populate("user",["name"]);//to return name from schema 
    res.json(profiles);
    }catch(err){
        console.error(err.message);
        return res.status(500).send(err.message);
    }
});

router.get("/user/:user_id",auth,async (req,res)=>{
    try{
    const profile=  await Profile.findOne({
        user: req.params.user_id
    }).populate("user",["name"]);//to return name from schema 
    if(!profile){
        return res.status(400).json({msg:"no profile for this givin user"});
       }
    res.json(profile);
    }catch(err){
        console.error(err.message);
        return res.status(500).send(err.message);
    }
});
//user/:user_id
router.delete("/",auth,async(req,res)=>{
    try{
    await Promise.all([
        Post.deleteMany({user: req.user.id}),
        Profile.findOneAndDelete({user: req.user.id}),
        User.findOneAndDelete({_id: req.user.id})
    ]);
    res.json({msg: "user information is deleted successfuly"});
    }catch(err){
        console.error(err.message);
        res.status(500).send(err.message);
    }
})
router.post("/upload",auth ,async(req,res)=>{
    try{
        upload(req,res,async(err)=>{
            if(err){
                res.status(500).send(`server error: ${err}`)
            }else{
                res.status(200).send(req.user.id);
            }
        })
    }catch(err){
        console.error(err.message);
        res.status(500).send(err.message);
    }
});

router.put("/experience",auth
,check('title',"title is required").notEmpty(),
check("company","company is required").notEmpty(),
check("from","date must be from the bast ").notEmpty()
.custom((value,{req})=>{
   return req.body.to ? value < req.body.to : true;
}),
async(req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    };
    try{
        const profile = await Profile.findOne({user: req.user.id});

        profile.experience.unshift(req.body);
        await profile.save();
        return res.json(profile);
    }catch(err){
    console.error(err.message);
    res.status(500).send(err.message);
    }
});

router.delete("/experience/:exp_id",auth,async(req,res)=>{
    try{
        const profile = await Profile.findOne({user: req.user.id});        
        profile.experience = profile.experience.filter(exp =>{
         return   exp._id.toString() !== req.params.exp_id;
        });
        await profile.save();
        return res.json(profile);
    }catch(err){
        console.error(err.message);
        res.status(500).send(err.message);
    }
});



router.put("/education",auth
,check('school',"school is required").notEmpty(),
check("degree","degree is required").notEmpty(),
check("fieldofstudy","fieldofstudy is required").notEmpty(),
check("from","date must be from the bast ").notEmpty()
.custom((value,{req})=>{
   return req.body.to ? value < req.body.to : true;
}),
async(req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    };
    try{
        const profile = await Profile.findOne({user: req.user.id});

        profile.education.unshift(req.body);
        await profile.save();
        return res.json(profile);
    }catch(err){
    console.error(err.message);
    res.status(500).send(err.message);
    }
});

// router.delete("/",auth,async(req,res)=>{
//     try{


//     }catch(err){
//     console.error(err.message);
//     res.status(500).send(err.message);
//     }
// })

router.delete("/education/:edu_id",auth,async(req,res)=>{
    try{
        const profile = await Profile.findOne({user: req.user.id});        
        profile.education = profile.education.filter(edu =>{
          return  edu._id.toString() !== req.params.edu_id;
        });
        await profile.save();
        return res.json(profile);
    }catch(err){
        console.error(err.message);
        res.status(500).send(err.message);
    }
})



module.exports = router;