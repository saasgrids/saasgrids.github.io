// The main application script, ties everything together.

var express   = require('express');
var mongoose  = require('mongoose');
var path      = require('path');
var bodyParser = require('body-parser')

var app       = express();

// connect to Mongo when the app initializes
mongoose.connect(process.env.DB_URL);

  app.use(bodyParser());
  // app.use(app.router);

var public = __dirname + "/public/";



// set up the RESTful API, handler methods are defined in api.js
var api = require('./controller.js');
// app.get('/', api.renderLanding);
app.post('/earlyacess/', api.earlyAccess);

// viewed at http://localhost:8080
app.get('/', function(req, res) {
    res.sendFile(path.join(public + "index.html"));
});

app.use('/', express.static(public));


app.listen(process.env.PORT);
console.log("Express server listening on port %d");
