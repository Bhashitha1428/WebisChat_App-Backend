const jwt = require('jsonwebtoken');
const config = require('../config/database');
const mongoose = require('mongoose');

const Course=require('../models/course');
const CourseSchema=Course.course;



const cloudinary = require('cloudinary');


function decode(req, res, next){
    //const token = req.headers.authorization.split(" ")[1];
   
    const token=req.header('Authorization');
    console.log(token)
   
   
    const decodeJWT = jwt.verify(token,config.secret);
 
    
    console.log(decodeJWT.user._id)
   
   
   // return dedecodeJWT;
   return decodeJWT.user._id;


    
  
}


function checkUserAlreadyRegisterd(req,res,next){
    console.log("BBBBBBBBBBB");
    console.log(req.body.courseId);
    try {
        
        const decodeUserID = decode(req, res, next);
        console.log(decodeUserID);
        
         CourseSchema.find({_id:req.body.courseId,registerUser:decodeUserID})
    .populate("registerUser")

         .then(user=>{
             console.log(user);
             console.log("AAAAAAA")
             if(user.length>=1)
             {
                 const a=typeof(user);
                 console.log(user.length);
                 //console.log(a);
            return  res.send("Already User Register this Course");
               // res.send(user)
             }
    else{
        next();
    }

         })
     
      
    } catch (error) {
        
        res.status(401).json({
           
            state: false
        })
    }






}

//check user already rate to particular courese or not

function checkUserAlreadyRate(req,res,next){
const userId=req.body.userId;
const courseId=req.body.courseId;
//console.log("Ddddddddddd")
CourseSchema
  .find({_id:courseId,ratedUser:userId})
  .then(course=>{
    console.log(course.length)
      if(course.length!=0){
          res.send("User Already rated ")
      }
      else{
       // console.log("iiiiii")
         
         next(); 
      }
  })
  .catch(err=>{
      //console.log("OOOOOOOOOO")
      res.status(500).json({
          state:false,
          
      })
  })



}


function storeCourse(req,res,next){
  
   console.log("GGGGGGGG")
//    cloudinary.uploader.upload(req.file.path, function(result) {
//     imageSecureURL = result.secure_url;
// })
     saveCourse(req,res)
     .then(result=>{
         console.log("Course stored sucessfully");
         res.status(200).json({
             course:result,
             state:true
         })
     })
     .catch(err=>{
        res.status(500).json({
            state:false,
            error:err
        })
     })
        

}

function saveCourse(req,res){
    try{
        console.log("WWWWWWWWW")
    cloudinary.uploader.upload(req.file.path, function(result) {
           imageSecureURL = result.secure_url;
           console.log(imageSecureURL);
           
           
    })
}catch(error ){
    console.log("KKKKKKK")
console.log("Handled error(because image not pass by user) "+error)
imageSecureURL="";


} 

    const course=new CourseSchema({
        name:req.body.name,
        author:req.body.author,
        description:req.body.description,
        catergory:req.body.catergory,
        subCatergory:req.body.subCatergory,
        type:req.body.type,
        skillLevel:req.body.skillLevel,
        permission:false,

        
        courseImg:imageSecureURL,
        //************** */

        topic:req.body.topic,
        file:req.body.file,
        videoId:req.body.videoId,
      //************* */
    
        
    });
    
    return course.save();


}



module.exports={
    checkUserAlreadyRegisterd:checkUserAlreadyRegisterd,
    storeCourse:storeCourse,
    checkUserAlreadyRate:checkUserAlreadyRate
}