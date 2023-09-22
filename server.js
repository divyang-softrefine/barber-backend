const express = require("express");
// var https = require('https');
var http = require('http');
var cors = require("cors");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
require('./src/db/mongoose')
const bodyParser = require("body-parser");
const path = require("path")
var fs = require('fs');

let app = express();
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));
app.use(cors({ origin: "*" }));

// Set up Global configuration access
dotenv.config();
app = require('./app.js');
let port = process.env.PORT || 5000;
app.set('port', port);
// app.use(express.static(path.join(__dirname, "dist")));


// Middleware for redirecting HTTP to HTTPS
// const httpRedirectMiddleware = (req, res, next) => {
//   if (req.protocol === 'http') {
//     res.redirect(`https://${req.headers.host}${req.url}`);
//   } else {
//     next();
//   }
// };

// app.use(httpRedirectMiddleware);

// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "dist", "index.html"));
// });



app.get('/',(req,res)=>{
  res.send("Server is Working Perfectly.....")
})

// Create an HTTP service.
var httpServer = http.createServer(app);


// Load the SSL certificate files
// const privateKey = fs.readFileSync('privkey.pem', {encoding: "utf8"});
// const certificate = fs.readFileSync('cert.pem', {encoding: "utf8"});
// const ca = fs.readFileSync('chain.pem', {encoding: "utf8"});

// const credentials = {
//   key: privateKey,
//   cert: certificate,
//   ca: ca
// };

// const httpsServer = https.createServer(credentials, app);


// Start both servers
const httpPort = 5000;
const httpsPort = 4000;

httpServer.listen(httpPort, () => {
  console.log(`HTTP server running on port ${httpPort}`);
});

// httpsServer.listen(httpsPort, () => {
//   console.log(`HTTPS server running on port ${httpsPort}`);
// });
