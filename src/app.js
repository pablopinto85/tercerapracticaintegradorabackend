const express = require("express");
const path = require("path");
const cartRouter = require("./routes/cartRouter");
const productsRouter = require("./routes/productRouter.js");
const vistaRouter = require("./routes/vistaRouter.js");
const userRouter = require("./routes/usersRouter.js");
const sessionRouter = require("./routes/sessionsRouter.js");
const passporConfig = require("./config/passport.config.js");
const { isUtf8 } = require("buffer");
const fs = require("fs");
const socketIo = require("socket.io");
const {Server} = require("socket.io");
const http = require("http");
const handlebars = require('express-handlebars');
const { error } = require("console");
const {default: mongoose} = require("mongoose");
const MongoStore = require("connect-mongo");
require ('dotenv').config();
const session = require("express-session");
const passport = require("passport");
const fileStore = require("session-file-store");
const { initializePassport, checkRole } = require("./config/passport.config");
const GitHubStrategy = require("passport-github2");
const cookieParser = require("cookie-parser"); //revisar si funciona
const { Contacts, Users, Carts, Products } = require("./dao/factory");
const router = express.Router();
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRouter');
const authMiddleware = require('./middleware/authMiddleware');

dotenv.config();

const app = express()
const server = http.createServer(app)
const io = new Server(server)
global.io = io;
const PORT = 8080


//MIDDLEWARES
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/auth', authRoutes);
app.use('/api', productRoutes);
app.use(authMiddleware);

io.on('connection', (socket) => {
    console.log('Cliente conectado');
  
    socket.emit('conexion-establecida', 'Conexión exitosa con el servidor de Socket.IO');
    socket.on('disconnect', () => {
      console.log('Cliente desconectado');
    });
});


server.listen(PORT, ()=>{
    console.log(`servidor corriendo en puerto ${PORT}`)
});


app.use(session({
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    mongoOptions: { useNewUrlParser: true, useUnifiedTopology: true }, ttl: 3500
}),
    secret: "clavesecreta",
    resave: false,
    saveUninitialized: true
}));


initializePassport();


app.use(passport.initialize())
app.use(passport.session());
app.use("/", cartRouter);
app.use("/", productsRouter); 
app.use("/", vistaRouter);
app.use("/", userRouter);
app.use("/", sessionRouter)

function sendPasswordResetEmail(email, token) {
  let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
      }
  });

  let mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Recuperar contraseña',
      text: `Haga clic en el siguiente enlace para restablecer su contraseña: http://localhost:3000/reset-password/${token}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          console.log(error);
      } else {
          console.log('Email enviado: ' + info.response);
      }
  });
}

router.post('/reset-password', async (req, res) => {
  let user = await User.findOne({ email: req.body.email });

  if (!user) {
      return res.status(404).json({ message: 'No se encontró el usuario con el correo electrónico proporcionado' });
  }

  let token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, { expiresIn: '1h' });
  sendPasswordResetEmail(user.email, token);

  res.json({ message: 'Se ha enviado un correo electrónico con un enlace para restablecer su contraseña' });
});

router.post('/new-password', async (req, res) => {
  let token = req.body.token;
  let decoded = jwt.verify(token, process.env.SECRET_KEY);

  if (!decoded) {
      return res.status(400).json({ message: 'Token inválido o expirado' });
  }

  let user = await User.findById(decoded.id);

  if (!user) {
      return res.status(404).json({ message: 'No se encontró el usuario con el ID proporcionado' });
  }

  if (req.body.newPassword === user.password) {
      return res.status(400).json({ message: 'No se puede colocar la misma contraseña' });
  }

  user.password = req.body.newPassword;
  await user.save();

  res.json({ message: 'Contraseña restablecida con éxito' });
});


app.engine("handlebars", handlebars.engine());

app.set("view engine", "handlebars");

app.set("views", __dirname + "/views");

app.use(express.static(path.join(__dirname, "public")));
