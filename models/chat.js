const mongoose=require('mongoose');

// Catergory Schema (This user only to diaplay main catergories into frontEnd)
const chatSchema=mongoose.Schema({
    userName:{type:String},
    message:{type:String},
    courseId:{type:String}
  
  })

  module.exports=mongoose.model('chat',chatSchema);