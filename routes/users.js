const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary');
const config = require('../config/database');
const User = require('../models/user');
const userController=require('../Controllers/userController');
const checkAuth=require('../middlewares/check-auth');
const bcrypt=require('bcryptjs');


const uploadController=require('../Controllers/uploadController');
const emailController = require('../controllers/emailController');



//Register User 
router.post('/register', userController.registerUser);





//upload user image for profile
router.post('/uploadUserImage/:userId', uploadController.userImageUpload.single('image'), (req, res, next) => {
    console.log("uploadUserImage")
    const userId = req.params.userId;
    User
        .find({ _id: userId })
        .exec()
        .then(user => {
            console.log("user found")
            cloudinary.uploader.upload(req.file.path, function(result) {
                imageSecureURL = result.secure_url;
                console.log(imageSecureURL)
                //console.log(result)
                user[0].imageURL = imageSecureURL;
                user[0]
                    .save()
                    .then(result => {
                        res.status(200).json({
                            state: true
                        }) 
                    })
            });
        })
        .catch(err => {
            res.status(401).json({
                state: false,
                message:"Errror"
            })
        })
})

//Authenticate(Login)
router.post('/authenticate', (req, res, next)=> {
    console.log("ooooo");
    const email= req.body.email;
    const password = req.body.password;
    console.log(email);
    console.log(password);

    userController.getUserByEmail(email, (err, user) => {
        if(err) throw err;
        if(!user){
            return res.json({success: false, msg: 'User not found'});
        }

        userController.comparePassword(password, user.password, (err, isMatch) => {
          if(err) throw err;
          if(isMatch){
              const token = jwt.sign({user: user},config.secret, {
                  expiresIn: 604800 // 1 week 
                
              }
              );
              console.log(token);
              
              res.header('x-auth-token',token);
              res.json({
                  success: true,
                  //token: 'JWT '+token,
                  token: token,
                  user: {
                      id: user._id,
                      name: user.fname,
                      role: user.role,
                      email: user.email,
                      
                  }
              });
          }else{
              return res.json({success: false, msg: 'worng password'})
          }
        });
    });
});

//profile
router.get('/profile',passport.authenticate('jwt',{session:false}), (req, res, next)=> {
  
    res.json({user:req.user});
});





//Authenticate
// router.post('/authenticate', (req, res, next)=> {
//     console.log("ooooo");
//     const email= req.body.email;
//     const password = req.body.password;

//    const user= userController.getUserByEmail(email)
//         //if(err) throw err;
//         //console.log(user);
//         if(!user){
//             return res.json({success: false, msg: 'User not found'});
//         }

//         userController.comparePassword(password, user.password, (err, isMatch) => {
//           if(err) throw err;
//           if(isMatch){
//               const token = jwt.sign({user: user},config.secret, {
//                   expiresIn: 604800 // 1 week 
                
//               }
//               );
//               console.log(token);
              
//               //res.header('x-auth-token',token);
//               res.json({
//                   success: true,
//                   //token: 'JWT '+token,
//                   token: token,
//                   user: {
//                       id: user._id,
//                       name: user.fname,
//                       role: user.role,
//                       email: user.email,
                      
//                   }
//               });
//           }else{
//               return res.json({success: false, msg: 'worng password'})
//           }
//         });
   
// });


//get all users details
router.get('/allUserDetails',(req,res)=>{
    User
      .find()
      .then(users=>{
          res.status(200).json(users);
      })
      .catch(err=>{
       res.status(500).json({
           error:err,
           mesg:"Users data taking error"
       })

      })


})




 
//get particular user by Id
router.get('/particularUser/:id',(req,res)=>{
      User
         .findById(req.params.id)
         .then(user=>{
           res.json(user);

         })
         .catch(err=>{
          res.json({
            error:err,
          })


         })
  

})
//get users by role
router.get('/findByRole/:role', (req, res, next) => {
    const role = req.params.role;
    User
        .find({ role: role })
        .exec() 
        .then(result => { 
          //  console.log(result);
                res.status(200).json({
                    User: result
            })
        })
        .catch(err => { 
            console.log(err);
            res.status(500).json({  
                error: err
            });
        });
})
////get all content providers
router.get('/contentProviders', (req, res, next) => {
    console.log("get All contentProvider user route") ;
    User
       .find({role:"contentProvider"})
       .exec()
       .then(users=>{
         
           res.status(200).json({
               contentProviders:users,
               state:true
           })
       })
       .catch(err=>{
           res.status(500).json({
               error:err,
               state:false
           })
       })
   
})

////get all Admin users
router.get('/admins', (req, res, next) => {
  console.log("get All admin user route") ;
    User
       .find({role:"admin"})
       .exec()
       .then(users=>{
         
           res.status(200).json({
               Admins:users,
               state:true
           })
       })
       .catch(err=>{
           res.status(500).json({
               error:err,
               state:false
           })
       })
   
})




//get prticular user registered course details by Id
router.get('/:userId', userController.checkUserIfExist, (req, res, next) => {
    console.log("get prticular user registered course details route");
    const Id = req.params.userId;
    User
        .findById(Id)
        .populate('registerCourse')
        .select('registerCourse')
      
        .exec()
        .then(result => {
            res.status(200).json({
                User: result
            })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                state: false
            });
        });
});


//edit user account details with password***
//check password of a loged user before edit his profile and Edit user profile
router.post('/editUserProfile/:userId', (req, res, next) => {
    const userId = req.params.userId;
    const currentPassword = req.body.password;
    // const thispassword;
    User
        .findById(userId)
        .exec()
        .then(user => {
            savedPassword = user.password;
            bcrypt.compare(currentPassword, savedPassword, (err, result) => {
                if(result){
                         
                    bcrypt.hash(req.body.newPassword, 10, (err, hash) => {
                        if(err){
                            return res.status(500).json({     
                            });
                        }else {
                                
                            User.update({_id:userId},{
                                $set:{
                                   fname: req.body.fname ,
                                   lname:req.body.lname , 
                                   password:hash 
                                }
                            })
                            .then(result=>{
                                res.status(200).json({
                                    state:true,
                                    user:result
                                })

                            })
                            .catch(err=>{
                                res.json(err);
                            })
                               
                               
                        }


                    })
  }


                   
                 else {
                    res.status(500).json({
                        state: false
                    })
                }
            })
        })
           .catch(err=>{
                 res.status(500).json({
                    error:err,
                    msg:"User not exit"
                })
          })
})

 
// edit(update) user Profile without password
router.put('/update/:id',  (req, res) => {
    const userId=req.params.id;
    console.log("In userDetails update route");
     User
         //.find({_id:userId})
         .update({_id:userId},{
            $set:{
                fname:req.body.fname,
                lname:req.body.lname
            }  
            
         })
         .then(result=>{
             if(result){
                 res.json({
                  result:result,
                  state:true   
                });
             }
         })
         .catch(err=>{
             res.status(500).json({
                 err:err,
                 msg:"user not exit or other error"
             });
         })

       





    // const c= await User.findByIdAndUpdate(req.params.id, {
    //      fname: req.body.fname ,
    //      lname:req.body.lname ,
    //      email:req.body.email,
         



    
    // },{
    //   new:true //return course with updated values
    // })
    // .exec()
    // .then(user=>{
    //   res.status(200).json({
    //      user:user,
    //      state:true 
    //   })
     
   
    // })
    // .catch(err=>{
    //   res.status(500).json({
    //     state:false,
    //     error:err
    // })
    // })
    
});


//delete user by Id
router.delete('/delete/:id',checkAuth.checkIfAdmin,userController.checkUserIfExist,(req,res)=>{
    console.log(" In user delete Route");
  const userId=req.params.id;
  
        User
              .findById(userId)
              .then(user=>{
                console.log(user)
              
                   if(!user){
                    res.status(500).json({
                       Message:"User is not found" ,
                       state:false
                      
                     })
                     }
                      else{
                      
                              User
                                   .deleteOne({_id:userId})
                                   .then(du=>{
                                    res.status(200).json({
                                      user:user,
                                      state:true,
                                      Message:"User was deleted"
                
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

//send reset password email to user
router.get('/forgotPassword/:email', (req, res, next) => {
    if(!req.params.email){
        res.status(401).json({
            state: false
        })
    } else {  
        const userEmail = req.params.email;
        console.log(userEmail);
        User 
            .find({ email: userEmail })
            .exec()
            .then(user => {
                if(user){
                    console.log(user[0]._id);
                    const verificationCode = userController.generateRandomNumber()
                    console.log(verificationCode);
                    emailController.sendVerificationCode(userEmail, verificationCode);
               
                    res.status(200).json({
                        state: true, 
                        userId: user[0]._id,
                        code: verificationCode
                    })
                } else {  
                    res.status(500).json({ 
                        state: false,
                        Message: "Not Registered User"
                    })
                }
            }) 
            .catch(err => {
                console.log(err);    
                res.status(500).json({
                    state: false
                })
            })
    }
});




//After verify the email this can save new password for password forgoten person
router.get('/newPassword/:email', (req, res, next) => {
    userEmail = req.params.email;
    //console.log(userEmail)
    User
        .find({ email: userEmail })
        .exec()
        .then(user => {  
            
            if(user){
                console.log(user[0]._id)
                const newPassword = userController.generateRandomPassword()
                console.log(newPassword);
                userController.resetPassword(user[0]._id, newPassword)
                emailController.sendNewPassword(userEmail, newPassword);
                    res.status(200).json({
                        state: true,
                        password: newPassword
                    })
            }
        })
        .catch(err => {
            res.status(401).json({
                error: err,
                state: false
            })
        })
})


 

module.exports = router;