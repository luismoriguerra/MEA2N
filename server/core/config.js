
module.exports = function (app, express, bodyParser, multipart) {
  'use strict';
  app.set('view engine', 'pug');
  app.use(express.static('public'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: false}));
  app.use(multipart({
    uploadDir: 'uploads'
  }));

  app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // intercept OPTIONS method
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    }
    else {
      next();
    }
  });
};
