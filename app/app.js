var express = require('express'),
    MongoClient = require('mongodb').MongoClient,
    db = require( './db' ),
    topics = require( './topics' ),
    config = require( './config' ),
    cookieParser = require('cookie-parser'),
    app = express();

var allowCrossDomain = function(req, res, next) {
  
  res.header('Access-Control-Allow-Origin', 'http://techaptitude.website.tk');
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

app.get('/', function(req, res, next){

  res.cookie('hostUrl', config.url );

  next();
});


//App router
app.use( allowCrossDomain );
app.use(cookieParser());
app.use( express.static( env == 'development' ? 'web' : 'www' ) );
app.use( '/topics', topics );


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



