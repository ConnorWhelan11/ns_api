'use strict';

const express = require('express');
const redis = require('redis');
var bodyParser = require('body-parser');

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

const redisHOST = '10.11.244.79';
const redisPORT = 6379;

var didConnect = 'not yet';
var key = 'locTable';
var errs;
var client = redis.createClient(redisPORT,redisHOST);


client.on('connect', function() {
    didConnect = 'connected!';
});

client.on('error', function(err){
  console.error('Redis error:', err);
  errs = err;
});

// App
const app = express();
app.use(bodyParser.json());

// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', "*")

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

app.get('/', (req, res) => {
  var response = 'You did it,' + didConnect;
  res.send(response);
});

app.post('/addLocations', function(req,res){
  var arr = req.body.Locations;
  var data = [];
  for (var i=0; i<arr.length; i++) {
      data.push(arr[i].name);
      data.push(JSON.stringify(arr[i]));
  }
  client.hmset(key,data);
  res.send({status:'OK'});
});

app.get('/getAllLocations', function(req,res){
  var data;
  client.hgetall(key, function(err, response) {
      if (response) {
        data = JSON.parse(response);
        res.send(data);
      }
      else{
        res.sendStatus(404);
      }
  });

});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
