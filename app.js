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
app.use('/css', express.static(path.join(__dirname + '/public/css')));
app.use('/js', express.static(path.join(__dirname + '/public/js')));
app.use('/fonts', express.static(path.join(__dirname + '/public/fonts')));
app.use('/tables', express.static(path.join(__dirname + '/public/tables')));

// Handling routes
app.get('/', function(req, res){
  res.render('index.ejs');
});

app.get('/clientDashboard', function(req, res){
  res.render('template_index.ejs');
});

app.get('/userDashboard', function(req, res){
  res.render('userDash.ejs');
});

app.get('/trainerDashboard', function(req, res){
  res.render('trainerDash.ejs');
});

// Login page
app.post('/login', function(req, res){
  var email = req.body.email;
  var pass = req.body.pass;
  console.log("login form submitted");
  console.log("user entered: " + email);
  console.log("user entered: " + pass);

  connection.query("SELECT * FROM Accounts WHERE Accounts.email = " + "'" + email + "'" + " AND Accounts.password = " + "'" + pass +"'", function(err, rows, fields) {
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
      console.log(rows[0].type);
      if (rows[0].type == 'user') {
        res.redirect('/userDashboard');
      } else if (rows[0].type == 'client') {
        res.redirect('/clientDashboard');
      } else if (rows[0].type == 'trainer') {
        res.redirect('/trainerDashboard');
      }
    } else {
      console.log('failed login');
      res.send('The email and or password you submitted was not found');
    }
  });
});

// Registration
app.post('/register', function(req, res){
  var email = req.body.email;
  var pass = req.body.pass;
  var type = req.body.type;
  console.log("registration form submitted")
  console.log("user entered " + email);
  console.log("user entered " + pass);
  console.log("user entered " + type);


  var query = "INSERT INTO Accounts(type, email, password) " +
              "VALUES (" + "'" + type + "', " + "'" + email + "', " + "'" + pass + "')";


  connection.query(query, function (err, rows, fields){


    if (err) {
      console.log(err);
      res.send('There is something wrong with your registration, please email us at matthewjwu@gmail.com');
    } else {
      console.log(rows);
      console.log('successful registration');
      res.redirect('/');
    }
  });


});

app.listen(5580, function(){
  console.log('Server started on Port 5580...');
});
