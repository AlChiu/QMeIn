/****************************************************/
/****************************************************/
/****************************************************/
/*													*/
/*QmeIn Web Application 1.0                         */
/*													*/
/*Date:												*/
/*March 16, 2017									*/
/*													*/
/*Team Members:										*/
/*Chauhan, Pranay									*/
/*Chiu, Alexander									*/
/*Kulkarni, Gargi									*/
/*Padsala, Chirag									*/
/*Pardhiye, Prathmesh								*/
/*													*/
/*About:											*/
/*QmeIn Web Application allows individuals to 		*/
/*digitally queue themselves into a line. This 		*/
/*gives individuals the freedom to be away from 	*/
/*the local environment from where the physical 	*/
/*transaction will occur. Thus, freeing the 		*/
/*individual to complete other tasks until the 		*/
/*time of transaction. QmeIn Web Application will	*/
/*will send notice(s) prior to transaction time,	*/
/*prompting the individual to arrive at the 	    */
/*transaction location.					            */
/*													*/
/****************************************************/
/****************************************************/
/****************************************************/

/*Load Module and Initialize App 				    */                                   
/****************************************************/
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var app = express();
var path = require('path');
var exphbs = require('express-handlebars');
var handlebars = require('handlebars');
var helpers = require('handlebars-form-helpers');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongo = require('mongodb');
var mongoose = require('mongoose');

/*Connect to Database using Mongoose to Local Data	*/
/****************************************************/
mongoose.connect('mongodb://localhost:27017/data');
var db = mongoose.connection;

/*Set Parsing Modules               */
/****************************************************/
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

/*Set 'Handlebars' as Template Engine		        */
/****************************************************/
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({defaultLayout:'layout'}));
app.set('view engine', 'handlebars');


/*Register Handlebars Increment Function	        */
/****************************************************/
handlebars.registerHelper("inc", function(value, options){
    return parseInt(value) + 1;
});


/*Register Handlebars Timer Function	        */
/****************************************************/
handlebars.registerHelper("timer", function(value, options){

   var interval = setTimeout(countDown, (value*1000));
   
   function countDown(){
	   console.log('Times up');
	}
});

/*Set Folder for Static Files						*/
/****************************************************/
app.use(express.static(path.join(__dirname, 'public')));


/*Set Sessions										*/
/****************************************************/
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));


/*Initialize and use Sessions through Passport      */
/*Middleware								        */
/****************************************************/
app.use(passport.initialize());
app.use(passport.session());


/*Parse and Validate URL 					        */
/****************************************************/
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));


/*Set 'Flash'								        */
/****************************************************/
app.use(flash());


/*Set Global Variables					            */
/****************************************************/
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

/*Load Routes                                       */
/****************************************************/
var indexRoutes = require('./routes/indexRoutes');
var userRoutes = require('./routes/userRoutes');
var merchantRoutes = require('./routes/merchantRoutes');

/*Set Routes							            */
/****************************************************/
app.use('/', indexRoutes);
app.use('/users', userRoutes);
app.use('/merchant', merchantRoutes);


/*Set Port								            */
/****************************************************/
app.listen(3000, function(){
  console.log('Server listening on Port: 3000');
});