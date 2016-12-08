// Set Requirements
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var mysql = require('mysql');

var app = express();
var account_id = null;
var userType_id = null;


var today = new Date();
var dd = today.getDate();
var mm = today.getMonth()+1; //January is 0!
var yyyy = today.getFullYear();

if(dd<10) {
    dd='0'+dd
}

if(mm<10) {
    mm='0'+mm
}
today = yyyy+'-'+mm+'-'+dd;
console.log('TODAY: ' + today);



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
app.use('/node_modules', express.static(path.join(__dirname + '/jquery/dist')));

// Handling routes
app.get('/', function(req, res){
  res.render('index.ejs');
});

app.get('/trainerDashboard', function(req, res){
  var username_query = "SELECT * FROM Trainer WHERE Accounts_id = " + account_id + " ";
  var usernameQueryObj = connection.query(username_query, (err, rows) =>{
    if (err) {
      console.log(err);
      res.send(err);
    }

    var fname = rows[0].fname;
    var lname = rows[0].lname;

    var foodBank_query = "SELECT * FROM Food_Info";

    var foodBankQueryObj = connection.query(foodBank_query, (err, rows) => {
      if (err) {
        console.log(err);
        res.send(err);
      }
      var foodArray = []
      for (i = 0; i < rows.length; i++) {
        foodArray[i] = rows[i];
      }

      var client_query = "SELECT Client.id, Client.Accounts_id, Client.fname, Client.lname FROM Client";
      var clientQueryObj = connection.query(client_query, (err, rows) => {
        if(err) {
          console.log(err);
          res.send(err);
        }
        var clientArray = []
        for (i = 0; i < rows.length; i++) {
          clientArray[i] = rows[i];
        }
        console.log('clients: ' + clientArray);

        var data = {
          fname : fname,
          lname : lname,
          foods: foodArray,
          clients: clientArray
        };
        res.render('trainerDash.ejs', data);
        console.log(data);
        console.log('ACCOUNT ID: ' + account_id);
      });
    });
  });

});

app.get('/userDashboard', function(req, res){
  res.render('userDash.ejs');
});


app.get('/clientProfile', function(req, res) {
  res.render('clientProfile.ejs');
});

app.get('/trainerProfile', function(req, res) {
  res.render('trainerProfile.ejs');
});


app.get('/clientDashboard', function(req, res){
  var username_query = "SELECT * FROM Client WHERE Accounts_id = " + account_id + " ";
  var usernameQueryObj = connection.query(username_query, (err, rows) =>{
    if (err) {
      console.log(err);
      res.send(err);
    }

    var fname = rows[0].fname;
    var age = rows[0].age;
    var weight = rows[0].weight;
    var height = rows[0].height;


    var cal = Math.round(66.5 + (13.8 * weight) + (5.0 * height) - (6.8 * age)) * 10 / 10;
    var protein = Math.round(((0.8 * weight)/4) * 10) / 10;
    var fat = Math.round(((0.3 * cal)/9) * 10) / 10;
    var carb = Math.round(((0.6 * cal)/4) * 10) / 10;

    var foodBank_query = "SELECT * FROM Food_Info";

    var foodBankQueryObj = connection.query(foodBank_query, (err, rows) => {
      if (err) {
        console.log(err);
        res.send(err);
      }
      var foodArray = []
      for (i = 0; i < rows.length; i++) {
        foodArray[i] = rows[i];
      }

      var diary_query = "SELECT Food.Food_Info_name FROM Food " +
                        "JOIN Food_Diary ON Food_Diary.id = Food.Food_Diary_id " +
                        "JOIN Client ON Client.id = Food_Diary.Client_id " +
                        "JOIN Accounts on Accounts.id = Client.Accounts_id " +
                        "WHERE Accounts.id = " + account_id + " AND Food.date = '" + today + "' ";
      var diaryQueryObj = connection.query(diary_query, (err, rows) => {
        if(err) {
          console.log(err);
          res.send(err);
        }
        var diaryArray = []
        for (i = 0; i < rows.length; i++) {
          diaryArray[i] = rows[i];
        }
        console.log('diary: ' + diaryArray);

        var data = {
          fname : fname,
          age : age,
          weight: weight,
          height: height,
          cal: cal,
          protein: protein,
          fat: fat,
          carb: carb,
          foods: foodArray,
          diary: diaryArray
        };
        res.render('clientDash.ejs', data);
        console.log(data);
        console.log('ACCOUNT ID: ' + account_id);
      });
    });
  });

});

app.get('/userDashboard', function(req, res){
  res.render('userDash.ejs');
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


// Registration section: create account with type, email, pass. Transfers IDs appropriately accross tables
// and creates food diary per account
  var registration_query = "INSERT INTO Accounts(type, email, password) " +
              "VALUES (" + "'" + type + "', " + "'" + email + "', " + "'" + pass + "')";

  connection.query(registration_query, function (err, rows, fields){
    if (err) {
      console.log(err);
      res.send('There is something wrong with your registration, please email us at matthewjwu@gmail.com');
    } else {
      console.log(rows);
      console.log('successful registration');

      var getAccountID_query = "SELECT * FROM Accounts WHERE Accounts.email = '" + email + "' AND Accounts.password = '" + pass + "'";

      connection.query(getAccountID_query, function(err, rows, fields){
        if (err) {
          console.log(err);
          res.send('There is something wrong with your registration, please email us at matthewjwu@gmail.com');
        } else {
          console.log(rows);
          console.log('got Account ID: ' + rows[0].id);
          account_id = rows[0].id;

          var id_transfer_query = "INSERT INTO  " + type + " (Accounts_id) " +
                      "VALUES (" + account_id + ")";

          connection.query(id_transfer_query, function(err, rows, fields){
            if (err) {
              console.log(err);
              res.send('There is something wrong with your registration, please email us at matthewjwu@gmail.com');
            } else {
              console.log(rows);
              console.log('successful id transfer');
            }
          });
        }

        var getID_query = "SELECT * FROM " + type + " WHERE Accounts_id = " + account_id + "";

        connection.query(getID_query, function(err, rows, fields){
          if (err) {
            console.log(err);
            res.send('There is something wrong with your registration, please email us at matthewjwu@gmail.com');
          } else {
            console.log(rows);
            userType_id = rows[0].id;
            console.log('got user type id: ' + userType_id);

            if (type == 'User' || type == 'Client') {
              var createDiary_query = "INSERT INTO Food_Diary(" + type +"_id) VALUES (" + userType_id + ")";

              connection.query(createDiary_query, function(err, rows, fields){
                if (err) {
                  console.log(err);
                  res.send('There is something wrong with your registration, please email us at matthewjwu@gmail.com');
                } else {
                  console.log(rows);
                  console.log('created diary for ' + type + ' id ' + userType_id);
                }
              });
            }
            }

        });
      });
      res.redirect('/');
    }
  });
});

// Trainer settings
app.post('/trainerSettings', function(req, res){
  var fname = req.body.first_name;
  var lname = req.body.last_name;

  if (!account_id) {
    res.send('Please log in and try again, we have lost your connection with your account id');
  }
  console.log('user entered: ' + fname);
  console.log('user entered: ' + lname);


  var personal_info_query = "UPDATE Trainer SET fname = '" + fname + "', lname = '" + lname + "'" +
              " WHERE Trainer.Accounts_id = " + account_id + "";

  connection.query(personal_info_query, function(err, rows, fields){
    if (err) {
      console.log(err);
    } else {
      console.log(rows);
      console.log('updated personal info for account id: ' + account_id);
      res.redirect('/trainerDashboard');
    }
  });
});


// Client settings
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

// Client dashboard
app.post('/clientDashboard',function(req,res){
  var name = req.body.selected;
  console.log('selected: ' + name);
  console.log("Account ID:" + account_id);
  var typeID = null;
  var diaryID = null;
  var typeID_query = "SELECT * FROM Client WHERE Accounts_id = " + account_id + "";


  connection.query(typeID_query, function(err, rows, fields){
    if(err) {
      console.log(err);
    } else {
      console.log(rows);
      typeID = rows[0].id;
      console.log('type ID: ' + typeID);

      var diaryID_query = "SELECT * FROM Food_Diary WHERE Client_id = " + typeID + "";

      connection.query(diaryID_query, function(err, rows, fields){
        if(err) {
          console.log(err);
        } else {
          console.log(rows);
          diaryID = rows[0].id;
          console.log('diary ID: ' + diaryID);
          console.log('TODAY: ' + today);


          var addFood_query = " INSERT INTO Food(Food_Diary_id, Food_Info_name, date) VALUES("+ diaryID + ", '"+ name +"', '"+ today +"' )";

          connection.query(addFood_query, function(err, rows, fields){
            if(err) {
              console.log(err);
            } else {
              console.log(rows);
              console.log('added ' + name + 'to client ID: ' + typeID);
            }
          });
        }
      });
    }
  });

  res.redirect('/clientDashboard');
});

// Trainer dashboard
app.post('/trainerDashboard',function(req,res){
  var client_id = req.body.selected;
  console.log('client ID selected: ' + client_id);
  console.log("Trainer Account ID:" + account_id);
  var trainer_id = null;
  var trainerID_query = "SELECT * FROM Trainer WHERE Accounts_id = " + account_id + "";


  connection.query(trainerID_query, function(err, rows, fields){
    if(err) {
      console.log(err);
    } else {
      console.log(rows);
      trainer_id = rows[0].id;
      console.log('trainer ID: ' + trainer_id);

      var transferTrainerID_query = "UPDATE Client SET Trainer_trainer_id = "+ trainer_id +" WHERE Client.id = "+ client_id+ " ";

      connection.query(transferTrainerID_query, function(err, rows, fields){
        if(err) {
          console.log(err);
        } else {
          console.log(rows);
          console.log('updated client id: ' + client_id + ' with trainer id: ' + trainer_id);
        }
      });
    }
  });
  res.redirect('/trainerDashboard');
});


app.listen(5580, function(){
  console.log('Server started on Port 5580...');
});
