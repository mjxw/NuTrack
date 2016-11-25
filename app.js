// Set Requirements
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');

var app = express();

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views/login'));

//body-parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

//Set static path
app.use(express.static(path.join(__dirname, 'public')));
app.use('/js', express.static(path.join(__dirname + '/views/login/js')));
app.use('/css', express.static(path.join(__dirname + '/views/login/css')));

// Handling routes
app.get('/', function(req, res){
  res.render('login_index');
});

app.listen(3000, function(){
  console.log('Server started on Port 3000...');
});
