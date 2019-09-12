const express = require('express');
const app=express();
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const mongoose = require('mongoose');
const config = require('./config/database');
const http = require('http');

const chatSchema=require('./models/chat');




const usersRoutes = require('./routes/users');
const courseRoutes = require('./routes/course');
const catergoryRoutes=require('./routes/catergory');
const subCatergoryRoutes=require('./routes/subCatergory');


//port num
const port = process.env.PORT || 3000;

//start server
const server = http.createServer(app);

//soket.io 
var io=require('socket.io').listen(server);

io.on('connection',(socket)=>{
  console.log('new connection made');

socket.on('join',function(data){

      socket.join(data.courseId);//joing user in course chat
      console.log(data.userId+' joined the room : '+data.courseId);

     socket.broadcast.to(data.courseId).emit('new user joined',{user:data.userId,message:'has joined this room'});
     
});

socket.on('leave',function(data){
  console.log(data.userId+' left the room :'+data.courseId);
  socket.broadcast.to(data.courseId).emit('left room',{user:data.userId,message:' has left this room'});
  socket.leave(data.courseId);
});

socket.on('message',function(data){
  io.in(data.courseId).emit('new message',{user:data.userId,message:data.message});
 // chat.insert({username:data.userId,message:data.message});
  const chat=new chatSchema({
    userName:data.userId,
    message:data.message,
    courseId:data.courseId

  })
  chat.save();

})

socket.on('getMessage',function(data){
  console.log("GET Message");
  chatSchema.find({courseId:data.courseId})
  .then(result=>{
    io.in(data.courseId).emit('past messages',{result});
    console.log("AAAAAAAAAAAA")
    console.log(result)
  })

})

  


})


///////

// server.listen(port);
server.listen(port, () =>{
   console.log('server started on port '+port);
});

//connect to database
mongoose.connect(config.database);


//on connection
mongoose.connection.on('connected', () => { 
  console.log('connected to database '+config.database)
});

//on error
mongoose.connection.on('error', (err) => {
  console.log('database error '+err)
});

 ////////////////////////////
app.use((req, res, next)=>{
  res.header("Access-Control-Allow-Origin","*");
  res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if(req.method === 'OPTIONS'){ 
      res.header('Access-Control-Allow-Methods','PUT, POST, PATCH, DELETE')
      return res.status(200).json({});
  }
  next();
});
/////////////////////////



//cors middleware
app.use(cors());

//set static folder
app.use(express.static(path.join(__dirname, 'public')));

//body parser middleware
app.use(bodyParser.json());

//passport middleware
app.use(passport.initialize());
app.use(passport.session());

require('./config/passport')(passport);



//index route
app.get('/', (req, res, next) =>{
  console.log("index");
  res.send('invalid Endpoint');
});

app.use('/users',usersRoutes);
app.use('/course',courseRoutes);
app.use('/subCatergory',subCatergoryRoutes);
app.use('/catergory',catergoryRoutes);

app.use((req, res, next)=>{
  const error = new Error('Not Found');
  error.status(404);
  next(error);
});

app.use((error, req, res, next)=>{ 
  res.status(error.status || 500);
  res.json({ 
      error: {
          message: error.message
      }
  });
}); 

module.exports = app;