//
// # SimpleServer
//
// A simple chat server using Socket.IO, Express, and Async.
//
//var http = require('http');
//var path = require('path');


//var express = require('express');

//
// ## SimpleServer `SimpleServer(obj)`
//
// Creates a new instance of SimpleServer with the following options:
//  * `port` - The HTTP port to listen on. If `process.env.PORT` is set, _it overrides this value_.
//
//var router = express();
//var server = http.createServer(router);




//server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  //var addr = server.address();
  //console.log("Chat server listening at", addr.address + ":" + addr.port);
//});


var http = require('http');
var path = require('path');
var express = require('express');
var mongoose = require('mongoose');
var Post = require('./models/Post.js');

//version that stores like counts in memory
//var likeCounts = {};

//
// ## SimpleServer `SimpleServer(obj)`
//
// Creates a new instance of SimpleServer with the following options:
//  * `port` - The HTTP port to listen on. If `process.env.PORT` is set, _it overrides this value_.
//
var router = express();
var server = http.createServer(router);

//establish connection to our mongodb instance
//use your own mongodb instance here
mongoose.connect('mongodb://pritpalKaur:123456@ds131312.mlab.com:31312/instagram');

/*sample code that creates a Post object
var post = new Post({ 
  image: './img/glyphicons-halflings-white.png',
  comment: 'cool glphicon',
  likeCount: 0,
  feedbackCount: 0
});
//and then saves it to the mongodb instance we connected to above
post.save(function (err) {
  if (err) {
    console.log(err);
  } else {
    console.log('posted');
  }
});
*/

//tell the router (ie. express) where to find static files
router.use(express.static(path.resolve(__dirname, 'client')));
//tell the router to parse JSON data for us and put it into req.body
router.use(express.bodyParser());

//tell the router how to handle a get request to the root 
router.get('/', function(req, res){
  console.log('client requests posts.html');
  //use sendfile to send our posts.html file
  res.sendfile(path.join(__dirname, 'client/view','posts.html'));
});

//tell the router how to handle a post request to /posts
router.post('/posts', function(req, res){
  console.log('client requests posts list');
  
  //go find all the posts in the database
  Post.find({})
  .then(function(paths){
    //send them to the client in JSON format
    res.json(paths);
  })
  
  //this code just creates some posts directly without going to the database
  //res.json([
  //  {image: 'img/test.jpg', comment: 'test message 1'},
  //  {image: 'img/test.jpg', comment: 'test message 2'}
  //]);
});

//tell the router how to handle a post request to /incrLike
router.post('/incrLike', function(req, res){
  console.log('increment like for ' + req.body.id);
  //the client will send us the ID for the post for which we should increment the like
  //this will be in req.body.id
  
  //this version counts likes in memory only
  //var count = likeCounts[req.body.id];
  //if (count)
  //  count++;
  //else
  //  count = 1;
  //likeCounts[req.body.id] = count;

  //go get the post record
  Post.findById(req.body.id)
  .then(function(post){
    //increment the like count
    post.likeCount++;
    //save the record back to the database
    return post.save(post);
  })
  .then(function(post){
    //a successful save returns back the updated object
    res.json({id: req.body.id, count: post.likeCount});  
  })
  .catch(function(err){
    console.log(err);
  })
});

//set up the HTTP server and start it running
server.listen(process.env.PORT || 3000, process.env.IP || '0.0.0.0', function(){
  var addr = server.address();
  console.log('Server listening at', addr.address + ':' + addr.port);
});
