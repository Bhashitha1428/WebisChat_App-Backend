const express=require('express');
const router=express.Router();
const cloudinary = require('cloudinary');
const Course=require('../models/course');
const courseSchema=Course.course;


const userSchema=require('../models/user');
const courseController=require('../Controllers/courseController');


const checkAuth=require('../middlewares/check-auth');

const uploadController=require('../Controllers/uploadController');


//custom middleware
//const auth=require('../middlewares/auth');
//const authrole=require('../middlewares/authrole');



const multer=require('multer');
const storage=multer.diskStorage({
    destination:function(req,file,callback){
        callback(null,'./uploads/')
    },
    filename:function(req,file,callback){
        callback(null,file.originalname)
    }
    
})




const upload=multer({storage:storage,
    limits:{
    fileSize:1024*1024*10  //max fileSize 10Mb
}//,
//fileFilter:myfileFilter
});





//get permission true courses
router.get('/display',(req,res)=>{
  
   courseSchema.find({permission:true})
   .exec()
   .then(course=>{
     // console.log(typeof(course))
       //console.log(course.name);
      // console.log(course.length);
     const a="th"
       course.forEach(c=>{
        // console.log(c.name);
         const title=(c.name).toLowerCase();
         if(title.indexOf(a)==-1){

         }
         else{
           console.log(c.name);
         }
       })

         //  console.log(course);
         res.json(course)

    })
    .catch(err=>{
        console.log("Course detail retriving error:"+err);
    })

  //let course= await courseSchema.find({registerUser:"5d02f6aca2f9bc27742a122c"})
  //.populate('registerUser','name -_id')
  //.select()
  //select({name:1,id:1}).limit(4).sort({name:1})
  //res.json(course);


})


//get permission false courses(For Admins)
router.get('/display/permissionDenyCourse',(req,res)=>{
  
  courseSchema.find({permission:false})
  .exec()
  .then(course=>{
  
        res.json(course)

   })
   .catch(err=>{
       console.log("Course detail retriving error:"+err);
   })



})

//get particular course
router.get('/display/:id',(req,res)=>{
 courseSchema
         .findById(req.params.id)
         .then(course=>{
           res.json(course);

         })
         .catch(err=>{
          res.json({
            error:err,
          })


         })
  

})




//get course into particular catergory
router.get('/catergory',(req,res)=>{

const catergoryName=req.body.catergoryName
console.log(catergoryName)
courseSchema
      .find({catergory:catergoryName})
      .exec()
      .then(course=>{

        res.json(course);
        // res.status(500).json({
        //   result:course,
        //   state:true
        // })
      })

      .catch(err=>{
        console.log("HHHHHHHHH")
        res.status(200).json({
          error:err,
          state:false

          
        })
      })
})



//get course into particular Sub catergory
router.get('/catergory/subCatergory',(req,res)=>{
console.log("CCCCCCCCC")
  const subCatergoryName=req.body.subCatergory
  console.log(subCatergoryName);
  courseSchema
        .find({subCatergory:subCatergoryName})
        .exec()
        .then(course=>{
  
          //res.json(course);
          res.status(500).json({
            result:course,
            state:true
          })
        })
        
        .catch(err=>{
          console.log("HHHHHHHHH");
          res.status(200).json({
            error:err,
            state:false
  
            
          })
        })
  })

//store course
router.post('/put',  uploadController.userImageUpload.single('image'),courseController.storeCourse);


//course file upload and return url 
router.post('/put/file',uploadController.userImageUpload.single('file'),(req,res)=>{
//   cloudinary.uploader.upload(req.file.path, function(result) {
//     imageSecureURL = result.secure_url;
//     res.status(200).json({
//       fileUrl:imageSecureURL,
//       state:true
//     })

// })

try{
  cloudinary.uploader.upload(req.file.path, function(result) {
  fileUrl= result.secure_url;
  res.status(200).json({
    fileUrl:fileUrl,
    state:true
  })
          
})
}catch(error ){
console.log("Handled error"+error)
} 

})





//store course

//courseController.validateCourse
router.post('/store',upload.single('courseImg'), (req,res)=>{
    console.log("BBBBB")
   //console.log(req.file);
  
    
    const newCourse=new courseSchema;
    newCourse.name=req.body.name;
    newCourse.author=req.body.author;
    newCourse.duration=req.body.duration;
   // newCourse.content=req.body.content;
    newCourse.description=req.body.description;
    newCourse.catergory=req.body.catergory;
    newCourse.subCatergory=req.body.subCatergory;
    newCourse.url=req.body.url;
    //newCourse.courseImg=req.file.path;
   // newCourse.registerUser=req.body.objectId;
   


    newCourse.save()
    .then(result=>{
        res.json(result)
       // console.log(result);
    })
    .catch(err=>{
      res.status(500).json({
        state:false,
        error:err
    })



        
    })

//    let course= await newCourse.save()
//      if(course){
//          res.json(course);
//          console.log("Registration Sucessful");
//      }
//      else{
//          console.log("registration error");
//      }

})


//update exsiting course
router.put('/update/:id', async (req, res) => {
    console.log("IN course update Route");
    const c= await courseSchema.findByIdAndUpdate(req.params.id, {
         name: req.body.name,
         author:req.body.author ,
         duration:req.body.duration, 
         
         description:req.body.description

    
    },{
      new:true //return course with updated values
    })
    .exec()
    .then(course=>{
      res.json(course)
     
   
    })
    .catch(err=>{
      res.status(500).json({
        state:false,
        error:err
    })
    })
    


    // const course = await courseSchema.findByIdAndUpdate(req.params.id, {
    //      name: req.body.name ,
    //      author:req.body.author ,
    //      duration:req.body.duration, 
    //      content:req.body.content,
    //      description:req.body.description

    
    // }, {
    //   new: true
    // });
  
    // if (!course) return res.status(404).send('The Course with the given ID was not found.');
    
    // res.send(course);

  

  });



//Give permission to particular course or deny permission to particular course
//update permission attribute exsiting course
//checkAuth.checkIfAdmin
router.put('/givePermissionOrNot/:id', async (req, res) => {
  console.log("IN course Permission give or deny route");
  const c= await courseSchema.findByIdAndUpdate(req.params.id, {
       permission:req.body.value //must pass boolean value because permission is boolen attribute in course model

  
  },{
    new:true //return course with updated values
  })
  .exec()
  .then(course=>{
    res.status(200).json({
      course:course,
      state:true
    
    })
   
 
  })
  .catch(err=>{
    res.status(500).json({
      state:false,
      msg:"course does not exist",
      error:err
  })
  })
  


});



  // delete existing course

  //[auth,authrole]
  
router.delete('/delete/:id',checkAuth.checkIfAdmin,(req,res)=>{
  console.log(" In course delete Route");
const deleteCourseId=req.params.id;

courseSchema
            .findById(deleteCourseId)
            .then(course=>{
              console.log(course)
            
                 if(!course){
                  res.status(500).json({
                     Message:"Course is not found" ,
                     state:false
                    
                   })
                   }
                    else{
                    
                      courseSchema
                                 .deleteOne({_id:deleteCourseId})
                                 .then(dc=>{
                                  res.status(200).json({
                                    course:course,
                                    state:true,
                                    Message:"Course was deleted"
              
                               })
                                   }) 
                   }
               })
               .catch(err=>{
                 res.status(500).json({
                      state:false,
                      Message:err

                 })
               })



})


  // //register users in particular course
  // //,courseController.checkUserAlreadyRegisterd
  // router.post('/registerCourse/:id',(req,res)=>{
  //   console.log("IN  register course route");
  //   const newuser=req.body.userId;
  //   const courseId=req.params.id;
  //   courseSchema
  //             .findById(req.params.id)
  //             .then(course=>{
  //              // console.log(course)
  //               if(!course){
  //                 res.status(200).json({
  //                   state:false,
  //                   Message:"Course not exit yet"
  //                 })
  //               }else{
  //             // update user Schema
  //               userSchema
  //                     .findById(newuser)
  //                     .then(user=>{
  //                       user.registerCourse.push(courseId);
  //                       user.save();
                           
  //                     })
                     

  //                  //update  course Schema
  //               course.registerUser.push(newuser);
                
  //               course.save()
  //               .then(result=>{
  //                 res.status(500).json({
  //                   course:result,
  //                   state:true
  //                 })
  //               })
  //             }
  //           })
            
  //             .catch(err=>{
  //               res.status(500).json({
  //                 state:false,
  //                 Message:"Errrrrrr"

  //            })
  //             })

  // })



  //register users in particular course courseController.checkUserAlreadyRegisterd
  router.post('/registerCourse/:id',(req,res)=>{
    console.log("IN  register course route");
    const newuser=req.body.userId;
    const courseId=req.params.id;
   // console.log(newuser);
    console.log(courseId);
    courseSchema
              .findById(req.params.id)
              .then(course=>{
                console.log(course.name)
                if(!course){
                  res.status(200).json({
                    state:false,
                    Message:"Course not exit yet"
                  })
                }else{
              // update user Schema
                userSchema
                      .findById(newuser)
                      .then(user=>{
                        user.registerCourse.push(courseId);
                        user.save()
                       
                        
                      })
                     

                   //update  course Schema
                course.registerUser.push(newuser);
                
                course.save()
                .then(result=>{
                  res.status(200).json({
                    course:result,
                    state:true
                  })
                })
              }
            })
            
              .catch(err=>{
                res.status(500).json({
                  state:false,
                  Message:"Errrrrrr"

             })
              })

  })


//get register users details in particular course
router.get('/registerUsers',(req,res)=>{
  console.log("AAAAAAAAAAA")

  courseSchema.findById(req.body.courseId)
  .then(course=>{
  
   if(!course){
  
    res.status(200).json({
      state:false,
      Message:"Course not exit yet"
    })
   }else
   { 
    
    courseSchema.findById(req.body.courseId)
    .populate("registerUser",'fname -_id')//name-_id means display registeruser name without his id
     .select('name')
     .then(result=>{
      
      res.status(200).json({
        course:result,
        state:true
      }) 
        })
        .catch(err=>{
           res.status(500).json({error:err,state:false})
           
           
        })
     
     
  }
})
  .catch(err=>{
    res.json(err)
    console.log("EEEEEEEEEEEEEEEE")
     
  })


})

//rating route
//checkAlreadyRate function use to give only one chance to partcular user for rating
router.post('/rating/:id',courseController.checkUserAlreadyRate,(req,res)=>{
  console.log("Course rating route");
  const courseId=req.body.courseId;
  const value=req.body.star;
  const userId=req.body.userId;
 
courseSchema
           .findOne({_id:courseId})  //can use findById also instead of findOne but cannot use find method
           .then(course=>{
            // console.log(course.name);
         
            course.ratedUser.push(userId);
          
            course.save()
           // console.log("ASASAS")
            
             
               
           })
           .catch(err=>{
             res.status(500).json(err);
           })




  courseSchema
      .findOneAndUpdate({_id:courseId},{
        $inc:{
          stars:value,
          count:1
           },
          
          },
          {
            new:true
          
          }) 

       .exec()   
      .then(result=>{
        if(result){
         

            res.status(200).json({
              state:true,
              stars:result.stars,
              count:result.count,
              rating:(result.stars/result.count)


            });
        }
    })
    .catch(error => {
        res.status(500).json({
          error: error,
          state :false,
          msg:"course not found or other error"
        
        });
        
    });



})





  
module.exports=router;