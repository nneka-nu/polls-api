var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

var config = require('./config');
var router = require('./router');

var server = express();

mongoose.connect(config.mongoURL);

server.set('views', path.resolve(__dirname, 'views'));
server.set('view engine', 'pug');

server.use('/api', function(req, res, next) {
  req.headers['content-type'] = 'application/json';
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

server.use(bodyParser.json());

server.use('/api', router);

server.get('/', function(req, res) {
  res.render('index');
});

server.get('/*', function(req, res) {
  res.send('404 Not Found.')
})

server.listen(config.port, function() {
  console.log('Listening on port: ' + config.port);
});