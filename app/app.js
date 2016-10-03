var express = require('express'),
    MongoClient = require('mongodb').MongoClient,
    db = require( './db' ),
    topics = require( './topics' ),
    users = require( './users' ),
    config = require( './config' ),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    app = express();

var allowCrossDomain = function(req, res, next) {
  
  res.header('Access-Control-Allow-Origin', 'http://www.tekaptitude.com');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');

  next();
  
}

var env = process.env.NODE_ENV || 'development';
config = config[env];

var url = 'mongodb://{username}:{password}@{host}:{port}/{db}'.replace( /{username}/, config.database.username )
    .replace( /{password}/, config.database.password )
    .replace( /{host}/, config.database.host )
    .replace( /{port}/, config.database.port )
    .replace( /{db}/, config.database.db );

app.get('/sessionData', function(req, res, next){

  res.json({
    'hostUrl' : config.url
  });
  
});


//App router
app.use( allowCrossDomain );
app.use(cookieParser());
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use( express.static( env == 'development' ? 'web' : 'web' ) );
app.use( '/topics', topics );
app.use( '/users', users );

// Monogo DB connection and Server start up

db.connect( url , function(err) {

  if ( err ) {

    console.log('Unable to connect to Mongo.', err);
    process.exit(1);

  } else {

    app.listen(process.env.PORT || 3000, function() {

      console.log('Listening on port 3000...');

    });

  }

});


function getJson(){
//['Java','.Net','Oracle', 'JavaScript', 'Html5', 'NodeJs', 'ActionScript', 'Objective C', 'Php', 'MongoDb', 'AngularJs', 'Android', 'XML', 'MySql','SqlServer','C#','Selenium', 'Testing', 'Shell Script', 'Linux', 'C++', 'C']
  var tests = ['Java','.Net','Oracle', 'JavaScript', 'Html5', 'NodeJs', 'ActionScript', 'Objective C', 'Php', 'MongoDb', 'AngularJs', 'Android', 'XML', 'MySql','SqlServer','C#','Selenium', 'Testing', 'Shell Script', 'Linux', 'C++', 'C'],
      template = {
        index:0,
        topic: "",
        title: "",
        level:0,
        questions:[]
      },
      finalJson = [],
      index = 0;

  for( var i = 0, len = tests.length; i < len; i++ ){

    var test = tests[i];

    for( var j = 0; j < 3; j++ ) {

      var data = {};

      data.index = index++;
      data.topic = test.replace(/ /g,'').toLowerCase();
      data.title = test;
      data.level = j;
      data.questions = [];
      for( var k = 0; k < 50; k++ ){

        data.questions[k] = {
          'question' : 'This is a sample question number '+(k+1)+' for test with title '+test,
          'choices'  : ['Option 1','Option 2', 'Option 3', 'Option 4'],
          'answer'   : 0,
          'index'    : k
        };

      }
      finalJson.push(data);
    }

  }

  return finalJson;

}
