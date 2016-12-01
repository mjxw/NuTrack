// Set Requirements
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var mysql = require('mysql');

var app = express();

var connection = mysql.createConnection({
  host     : 'vergil.u.washington.edu',
  user     : 'root',
  password : 'Wujiaxi1080!',
  database : 'mydb',
  port     : 5580
});

connection.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }
  console.log('connected as id ' + connection.threadId);

});


// View engine
app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, 'views/login'));
app.set('views', path.join(__dirname, 'views'));

//body-parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

//Set static path
app.use(express.static(path.join(__dirname, 'public')));
// app.use(express.static(path.join(__dirname, 'views')));
app.use('/js', express.static(path.join(__dirname + '/views/')));
app.use('/css', express.static(path.join(__dirname + '/views/')));

// Handling routes
app.get('/', function(req, res){
  res.render('index.ejs');
});

app.get('/clientDashboard', function(req, res){
  res.render('clientDash.ejs');
});

// Login page
app.post('/login', function(req, res){
  var email = req.body.email;
  var pass = req.body.pass;
  console.log("form submitted");
  console.log("user entered: " + email);
  console.log("user entered: " + pass);

  connection.query("SELECT * from Accounts WHERE Accounts.email = " + "'" + email + "'" + " AND Accounts.password = " + "'" + pass +"'", function(err, rows, fields) {
    // console.log(fields);
    // console.log(err);
    if (err) {
      console.log(err);
      res.render('/login', { err: err.message });
    } else {
      console.log(rows);
    }

    // If user is found
    if (rows.length) {
      console.log('successful login');
      res.redirect('/clientDashboard');
    } else {
      console.log('failed login');
      res.send('The email and or password you submitted was not found');
    }
    // connection.end();
  });
});

app.listen(5580, function(){
  console.log('Server started on Port 5580...');
});
