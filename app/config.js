var config = {

    development: {
        //url to be used in link generation
        url: 'http://localhost:3000',
        //mongodb connection settings
        //mongodb://saravanan86:knight1!@ds017246.mlab.com:17246/techassesment
        database: {
            host:   'ds017246.mlab.com',
            port:   '17246',
            db:     'techassesment',
            username: 'saravanan86',
            password: 'knight1!'
        },
        //server details
        server: {
            host: '127.0.0.1',
            port: '3000'
        }
    },
    production: {
        //url to be used in link generation
        url: 'https://tekaptitude.herokuapp.com',
        //mongodb connection settings
        database: {
            host: 'ds017246.mlab.com',
            port: '17246',
            db:   'techassesment',
            username: 'saravanan86',
            password: 'knight1!'
        },
        //server details
        server: {
            host:   'http://techassesment.herokuapp.com/',
            port:   '8000'
        }
    }
};
module.exports = config;