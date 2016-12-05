// Set Requirements
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var mysql = require('mysql');

var app = express();

var account_id = null;

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
  var username_query = "SELECT * FROM Client WHERE Accounts_id = " + account_id + " ";
  connection.query(username_query, (err,rows)=> {
    // console.log(rows[0]);


    // Calculate macros
    var cal = 66.5 + (13.8 * rows[0].weight) + (5.0 * rows[0].height) - (6.8 * rows[0].age);
    var protein = Math.round(((0.8 * rows[0].weight)/4) * 10) / 10;
    var fat = Math.round(((0.3 * cal)/9) * 10) / 10;
    var carb = Math.round(((0.6 * cal)/4) * 10) / 10;

    var clientObject = {
      fname: rows[0].fname,
      age: rows[0].age,
      weight: rows[0].weight,
      height: rows[0].height,
      cal: cal,
      protein: protein,
      fat: fat,
      carb: carb
    }
    if (err) {
      console.log(err);
      res.render('/template_index.ejs',clientObject);
    } else {
      res.render('template_index.ejs', clientObject);
    }
  });
});

app.get('/userDashboard', function(req, res){
  res.render('userDash.ejs');
});

app.get('/trainerDashboard', function(req, res){
  res.render('trainerDash.ejs');
});

app.get('/profile', function(req, res) {
  res.render('profile.ejs');
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
      account_id = rows[0].id;
      console.log('successful login');
      console.log('user logged in as a: ' + rows[0].type);
      console.log('user id is: ' + account_id);

      // Redirect to appropriate dashboard view
      if (rows[0].type == 'User') {
        console.log('you are a user');
        res.redirect('/userDashboard');
      } else if (rows[0].type == 'Client') {
        console.log('you are a client');
        res.redirect('/clientDashboard');
      } else if (rows[0].type == 'Trainer') {
        console.log('you are a trainer');
        res.redirect('/trainerDashboard');
      }



      // Login unsuccessful
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


  var registration_query = "INSERT INTO Accounts(type, email, password) " +
              "VALUES (" + "'" + type + "', " + "'" + email + "', " + "'" + pass + "')";




  connection.query(registration_query, function (err, rows, fields){


    if (err) {
      console.log(err);
      res.send('There is something wrong with your registration, please email us at matthewjwu@gmail.com');
    } else {
      console.log(rows);
      console.log('successful registration');

      var id_transfer_query = "INSERT INTO  " + type + " (Accounts_id) " +
                  "VALUES (" + rows.insertId + ")";

                  // console.log(id_transfer_query);

      connection.query(id_transfer_query, function(err, rows, fields){
        if (err) {
          console.log(err);
          res.send('There is something wrong with your registration, please email us at matthewjwu@gmail.com');
        } else {
          console.log(rows);
          console.log('successful id transfer');
        }
      });
      res.redirect('/');
    }
  });
});

// User settings
app.post('/clientSettings', function(req, res){
  var fname = req.body.first_name;
  var lname = req.body.last_name;
  var age = req.body.age;
  var weight = req.body.weight;
  var height = req.body.height;

  if (!account_id) {
    res.send('Please log in and try again, we have lost your connection with your account id');
  }
  console.log('user entered: ' + fname);
  console.log('user entered: ' + lname);
  console.log('user entered: ' + age);
  console.log('user entered: ' + weight);
  console.log('user entered: ' + height);
  console.log('on account id: ' + account_id);

  var personal_info_query = "UPDATE Client SET fname = '" + fname + "', lname = '" + lname + "', age = " + age + ", weight = " + weight + ", height = " + height + " " +
              " WHERE Client.Accounts_id = " + account_id + "";

  connection.query(personal_info_query, function(err, rows, fields){
    if (err) {
      console.log(err);
    } else {
      console.log(rows);
      console.log('updated personal info for account id: ' + account_id);
      res.redirect('/clientDashboard');
    }
  });


});


app.listen(5580, function(){
  console.log('Server started on Port 5580...');
});
