const createError = require('http-errors');
const express = require('express');
const http = require("http");
const {Server} = require("socket.io");
const cors = require("cors");
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const {start} = require("./services/db");

const indexRouter = require('./routes/index');
const ChatModels = require('./services/ChatModels');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET','POST'] 
  }
});

start();


// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'ejs');

io.on("connection", (socket)=>{
  console.log("Socket connected : " + socket.id);

  socket.on("register", async()=>{
    const database = await ChatModels.getChats();
    socket.timeout(1000).emit("receive_chats", database);
  })

  socket.on("create_chat", async (data)=>{
    const database = await ChatModels.createChat({
      name: data.name,
      online: 0,
      idRoom: Date.now(),
      author: data.author,
      data: []
    });
    io.emit("receive_chats", database);
  })

  socket.on("join_chat", async (data)=>{
    const database = await ChatModels.getChat({idRoom: data.roomInfo.idRoom});
    socket.join(data.roomInfo.idRoom);
    socket.timeout(1000).emit('receive_message', database);
    if(io.sockets.adapter.rooms.get(data.roomInfo.idRoom)){
      await ChatModels.changeOnline({idRoom: data.roomInfo.idRoom}, io.sockets.adapter.rooms.get(data.roomInfo.idRoom).size)
      const dataBas = await ChatModels.getChats();
      socket.broadcast.emit('receive_chats', dataBas);
    }
  })

  socket.on("receive_messages", async (data)=>{
    const database = await ChatModels.getChat({idRoom: data.roomInfo.idRoom});
    socket.emit("receive_message", database);
  })

  socket.on("send_message", async (data)=>{
    const database = await ChatModels.addMessage({idRoom: data.idRoom}, {author: {name: socket.handshake.auth.name, id: socket.handshake.auth.id}, message: data.message, date: data.date});
    io.to(data.idRoom).emit('receive_message', database);
    io.emit("receive_chats", await ChatModels.getChats());
  });

  socket.on("writed_message", (data)=>{
    socket.broadcast.to(data.roomInfo.idRoom).emit("writed_loader_active", socket.handshake.auth.name);
  });

  socket.on("unwrited_message", (data)=>{
    socket.broadcast.to(data.roomInfo.idRoom).emit("writed_loader_deactive", socket.handshake.auth.name);
  });

  socket.on("disconnect", async ()=>{ 
    const databases = await ChatModels.getChats();
    for(let i = 0; i < databases.length; i++){
        if(io.sockets.adapter.rooms.get(databases[i].idRoom)){
          await ChatModels.changeOnline({idRoom: databases[i].idRoom}, io.sockets.adapter.rooms.get(databases[i].idRoom).size);
        }else{
          await ChatModels.changeOnline({idRoom: databases[i].idRoom}, 0);   
        }
    }
    const database = await ChatModels.getChats();
    io.emit("receive_chats", database);
    console.log("Disconnected : " + socket.id);
  })
});


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = {app, server};
