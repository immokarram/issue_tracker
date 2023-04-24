'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const expect = require('chai').expect;
const cors = require('cors');
const apiRoutes = require('./routes/api.js');
const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner');
const helmet = require('helmet');
const mongoose = require('mongoose');
const app = express();
require('dotenv').config();
const nocache = require('nocache');




// security
app.use(helmet({
  frameguard: {
     action: 'deny'
  },
  // noCache: true, // remove this line
  hidePoweredBy: { 
    setTo: 'PHP 4.2.0' 
  },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'", "https://api.glitch.com"],
      styleSrc: ["'self'", "https://button.glitch.me"],
      scriptSrc: ["'self'", "https://code.jquery.com", "https://button.glitch.me", "https://api.glitch.com"],
      imgSrc: ["'self'", "https://hyperdev.com", "https://glitch.com", "https://cdn.glitch.com", "https://s3.amazonaws.com"]
    }
  }
}));
middleware: (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  nocache()(req, res, next);
}
;

app.use('/public', express.static(process.cwd() + '/public'));
app.use(cors({ origin: '*' })); //For FCC testing purposes only
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Sample front-end
app.route('/:project/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/issue.html');
  });

// Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  });

//For FCC testing purposes
fccTestingRoutes(app);
app.use(nocache());
mongoose
  .connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Successful database connection');

    // Routing for API
    apiRoutes(app);

    //Start our server and tests!
    app.listen(process.env.PORT || 3000, function () {
      console.log('Listening on port ' + process.env.PORT);
      if (process.env.NODE_ENV === 'test') {
        console.log('Running Tests...');
        setTimeout(function () {
          try {
            runner.run();
          } catch (e) {
            var error = e;
            console.log('Tests are not valid:');
            console.log(error);
          }
        }, 3500);
      }
    });
  })
  .catch((err) => {
    console.log('Database error: ' + err);
  });
