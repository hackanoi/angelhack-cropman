var fs           = require('fs')
var https        = require('https')
var http         = require('http')
var path         = require('path')
var childProcess = require('child_process')
var phantomjs    = require('phantomjs-prebuilt')
var binPath      = phantomjs.path

module.exports = execute;

function execute(query, number) {
  this.query = query;
  this.number = number;
}

execute.prototype.crawl = function() {
  var results = [];

  var childArgs = [
    path.join(__dirname, 'phantom.js'),
    this.query
  ];

  var stdout = childProcess.execFileSync(binPath, childArgs);

  var protocol = function(link) {
    return link.indexOf('https') === 0 ? https : http;
  }

  var links = stdout.toString().trim().split(',');

  if (links.length <= this.number) {
    return links;
  }

  for (var i = 0; i < this.number; i++) {
    results.push(links[i]);
  }

  return results;
};