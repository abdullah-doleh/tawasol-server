const express = require("express");
const {auth}= require("../utils/index");
const User = require("../models/User");
const Post = require("../models/Post");
const {check,validationResult}= require("express-validator");

const router = express.Router(); // to use put , get , post , delete

router.post("/",auth,
check("text","text is required").notEmpty()
,async(req,res)=>{
    const errors= validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }
    try{
        const user = await User.findById(req.user.id).select("-password");
        const newPost = new Post({
            text: req.body.text,
            name: user.name,
            user: req.user.id
        });

        const post = await newPost.save();
        res.json(post);

    }catch(err){
        console.error(err.message);
        return res.status(500).send(err.message);
    }
});

router.get("/",auth,async(req,res)=>{
    try{
        const posts = await Post.find().sort({date:-1});
        res.json(posts);
    }catch(err){
        console.error(err.message);
        return res.status(500).send("server error "+err.message);
    }
});

router.get("/:id",auth,async(req,res)=>{
    try{
        const post = await Post.findById(req.params.id);
        if(!post){
            return res.status(400).json({msg:'Post not found '+err.message});
        }
        res.json(post);
    }catch(err){
        console.error(err.message);
        return res.status(500).send(err.message);
    }
   
});

router.put('/like/:id',auth,async(req,res)=>{
    try{
        const user = await User.findById(req.params.id).select("-password");
        const post = await Post.findById(req.params.id);
        if(post.likes.some((like)=>like.user.toString()===req.user.id)){
         return res.status(400).json({msg:"post already liked"})   
        }
        post.likes.unshift({user: req.user.id});
        await post.save();
        return res.json(post.likes);
        }catch(err){
    console.error(err.message);
    return res.status(500).send(err.message);
    }
});


router.put('/unlike/:id',auth,async(req,res)=>{
    try{
        const post = await Post.findById(req.params.id);
        if(!post.likes.some((like)=>like.user.toString()===req.user.id)){
         return res.status(400).json({msg:"user has not liked the post "})   
        }
        post.likes = post.likes.filter((like)=>like.user.toString()!== req.user.id)
        await post.save();
        return res.json(post.likes);
        }catch(err){
    console.error(err.message);
    return res.status(500).send(err.message);
    }
});


router.post(
    "/comment/:id",
    auth,
    check("text","text is required").notEmpty(),
    async(req,res)=>{
    const errors= validationResult(req);
    if(!errors.isEmpty()){
    return res.status(400).json({errors:errors.array()});
    }
    try{
        const user = await User.findById(req.user.id).select("-password");
        const post = await Post.findById(req.params.id);
        const newComment = {
            text : req.body.text,
            name:user.name,
            user : req.user.id
        };
        post.comments.unshift(newComment);
        await post.save()
        res.json(post.comments);
    }catch(err){
    console.error(err.message);
    return res.status(500).send(err.message);
    }
    }
);
router.delete(
    "/comment/:id/:comment_id",
    auth,
    async(req,res)=>{
    try{
        const post = await Post.findById(req.params.id);
        const comment = post.comments.find((comment)=>{
            return comment.id === req.params.comment_id;
        });
        if(!comment){
            return res.status(404).json({msg:"comment dose not exist"});
        }
        //check if the user is autheraize
        if(comment.user.toString()!== req.user.id){
            return res.status(401).json({msg:"user is not authirze"})
        }
        post.comments =  post.comments.filter((comment)=>{
            return comment.id !== req.params.comment_id;
        });
        await post.save()
        return res.json(post.comments);
    }catch(err){
    console.error(err.message);
    return res.status(500).send(err.message);
    }
    }
);

router.delete("/:id",auth,async(req,res)=>{
    try{
        const user = await User.findById(req.user.id)
        const post = await Post.findById(req.params.id);
        if(!post){
            return res.status(404).json({msg:"Post not found"});
        }
      if(post.user.toString()!== req.user.id){
        return res.status(401).json({msg:"user is not authirized"})
      }
      await post.deleteOne();
      res.json({msg:"post is removed"})

    }catch(err){
        console.error(err.message);
    return res.status(500).send(err.message);
    }
}) 

module.exports = router;