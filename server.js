const express =require('express')
const morgan =require('morgan')
const dotenv = require('dotenv');
const connectDb = require('./config/db');
const cors=require("cors");
const appointmentController = require('./controllers/appointmentController');
const availibiltyController = require('./controllers/availibiltyController');
const cron = require('node-cron');



//dotenv config
dotenv.config();

//mongodb connection
connectDb();

//rest object
const app= express()
app.use(cors());
app.use(express.json())
app.use(morgan('dev'))
app.use((req, res, next) => {
  req.io = io;
  next();
});
const http = require('http');
const { Server } = require('socket.io');
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:4200",
    methods: ["GET", "POST"],
    allowedHeaders: ["content-type"],
    credentials: true
  }
});


io.on('connection', (socket) => {
  console.log('A user connected');

  // Lorsqu'un utilisateur rejoint avec son userId
  socket.on('join', (userId) => {
    console.log(`User ${userId} joined`);
    socket.join(userId); // L'utilisateur rejoint une salle avec son userId
  });

  // Gérer la déconnexion
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});


//routes
app.use("/auth",require("./routes/authRoute"))
app.use('/users',require('./routes/userRoute'));
app.use("/appointment",require('./routes/appointmentRoute'));
app.use("/availability",require("./routes/availibiltyRoute"));
app.use("/notification",require("./routes/notificationRoute"));

//appeller le service reminder 
cron.schedule('0 8 * * *', appointmentController.sendReminders);

cron.schedule('0 0 * * *', availibiltyController.deleteOldAvailabilityForAllDoctors);


//port
const port= process.env.PORT || 5000
//listen port
server.listen(port,()=>{
    console.log(`server is running on port ${port} in Mode ${process.env.DEV_MODE} `.bgCyan.white)
})
