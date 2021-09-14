// require('dotenv').config();
// var express = require('express');
var ParseServer = require('parse-server').ParseServer;
// var app = express();
// var morgan = require('morgan')
// app.use(morgan('combined'))


let liveQueryClassesObj = JSON.parse(process.env.PARSE_SERVER_LIVE_QUERY);
console.log('liveQueryClasses', liveQueryClassesObj);

let parseConfig = {
  databaseURI: process.env.PARSE_SERVER_DATABASE_URI, // Connection string for your MongoDB database
  cloud: './parse-cloud-code/main.js', // Absolute path to your Cloud Code
  // auth: {
  //   swf: {
  //     module: swfAuth
  //   }
  // },
  appName: process.env.PARSE_SERVER_APPNAME,
  // emailAdapter: {
  //   module: "parse-server-generic-email-adapter",
  //   options: {
  //      service: "Gmail", // Could be anything like yahoo, hotmail, etc, Full list - see below 
  //      email: process.env.GMAIL_ACCOUNT,
  //      password: process.env.GMAIL_PASSWORD
  //   }
  // },
  // emailAdapter: {
  //   module: "simple-parse-smtp-adapter",
  //   options: {
  //       fromAddress: process.env.GMAIL_ACCOUNT,
  //       user: process.env.GMAIL_ACCOUNT,
  //       password: process.env.GMAIL_PASSWORD,
  //       host: 'smtp.gmail.com',
  //       isSSL: true, //True or false if you are using ssl
  //       port: 465, //SSL port or another port
  //       name: 'stopmetsyn', //  optional, used for identifying to the server 
  //       //Somtimes the user email is not in the 'email' field, the email is search first in
  //       //email field, then in username field, if you have the user email in another field
  //       //You can specify here
  //       // emailField: 'username', 
  //       templates: {
  //           //This template is used only for reset password email
  //           resetPassword: {
  //               //Path to your template
  //               template: __dirname + '/views/email/reset-password',
  //               //Subject for this email
  //               subject: 'Reset your password'
  //           },
  //           verifyEmail: {
  //               template: __dirname + '/views/email/verify-email',
  //               subject: 'Verify Email'
  //           }
  //       }
  //   }
  // },

  appId: process.env.PARSE_SERVER_APPLICATION_ID,
  masterKey: process.env.PARSE_SERVER_MASTER_KEY, // Keep this key secret!
  // fileKey: 'optionalFileKey',
  // serverURL: 'http://localhost:1337/parse' // Don't forget to change to https if needed
  // serverURL: `${process.env.BACKEND_SERVER_PROTOCOL}://${process.env.BACKEND_SERVER}:1337/parse`// Don't forget to change to https if needed
  serverUrl: process.env.PARSE_SERVER_URL,
  publicServerURL: process.env.PARSE_SERVER_PUBLIC_URL,
  startLiveQueryServer: process.env.PARSE_SERVER_START_LIVE_QUERY_SERVER,
  liveQueryServerOptions: {
    logLevel: 'VERBOSE'
  },
  liveQuery: liveQueryClassesObj
}

console.log('parse config: ', parseConfig);

ParseServer.start(parseConfig, _ => console.log('started!!!'));

// var api = new ParseServer(parseConfig);

// Serve the Parse API on the /parse URL prefix
// app.use('/parse', api);


// // Initialize a LiveQuery server instance, app is the express app of your Parse Server
// let httpServer = require('http').createServer(app);
// httpServer.listen(process.env.PARSE_PORT, function () {
//   console.log('parse-server running on port ' + process.env.PARSE_PORT);
// });

// ParseServer.createLiveQueryServer(httpServer);
 
// app.listen(process.env.PARSE_PORT, function () {
//   console.log('parse-server running on port ' + process.env.PARSE_PORT);
// });