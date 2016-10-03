var express = require('express');
var execute = require('./execute');
var app = express();

var resMsg = function(status, message, images) {
  return {
    status: status,
    message: message,
    images: images
  }
}

app.get('/api/v1/search/:q?/:n?', function (req, res) {
  if (req.params.q === undefined) {
    res.json(resMsg('error', 'Query must not be null', []));
  }

  var number = 0;
  if (req.params.n === undefined) {
    number = 100;
  }

  if (req.params.n !== undefined) {
    number = Number(req.params.n);
    if (isNaN(number)) {
      res.json(resMsg('error', 'Numbers of images must be numeric', []));
    }
    number = 0 < number && number < 100 ? number : 100;
  }

  var images = (new execute(req.params.q, number)).crawl();

  res.json(resMsg('success', 'Results for ' + req.params.q, images));
});

app.listen(3000, function() {
  console.log('Server is starting');
});