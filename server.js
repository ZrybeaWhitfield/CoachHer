const express         = require("express")
const app             = express()
require("dotenv").config()
const mongoose        = require("mongoose")
const morgan          = require('morgan');
const passport        = require('passport')
const session         = require("express-session")
const cookieParser    = require('cookie-parser');
const bodyParser      = require('body-parser');
const multer          = require("multer")
const configDB        = require("./config/database")
const server          = require('http').Server(app)
const io              = require('socket.io')(server)
const MongoClient     = require('mongodb').MongoClient
const flash           = require('connect-flash');

var db
const databaseURL = process.env.DB_STRING
console.log(databaseURL);



mongoose.connect(databaseURL, (err, database) => { //****GET HELP NOT FINDING PATH
  if (err) return console.log(err)
  db = database
  require('./app/routes.js')(app, passport, db, multer);
}); // connect to our database
//passport config
require("./config/passport")(passport)

configDB()



app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(express.static("public"))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.set("view engine", "ejs")


app.use(
    session({
      secret: 'keyboard cat',
      resave: false,
      saveUninitialized: false,

    })
  )

  // app.get('/', function(req, res) {
  //     res.render('index.ejs');
  // });

app.use(passport.initialize())
app.use(passport.session())
app.use(flash());

// app.get('/room/:room', (req,res) => {
//   res.render('room', { roomId: req.params.room })
// })

io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) =>{
    console.log(roomId, userId);
    socket.join(roomId)
    // socket.to(roomId).broadcast.emit('user-connected', userId)
    socket.broadcast.to(roomId).emit('user-connected', userId)

    socket.on('disconnect', () => {
     socket.broadcast.to(roomId).emit('user-disconnected', userId)
    })

  })
})

server.listen(process.env.PORT, ()=>{
  console.log(`Server is running! Whoo look at him go!`);
})
