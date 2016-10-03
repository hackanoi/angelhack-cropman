var page = require('webpage').create();
var system = require('system');
var args = system.args;

page.settings.userAgent = 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/27.0';
page.open('https://www.google.com/search?site=&tbm=isch&source=hp&biw=1366&bih=640&q=' + args[1],
  function(status) {
  var result = page.evaluate(function() {
    // we cannot pass args here so just grab all the results
    var links = [];
    var collections = document.getElementsByClassName('rg_meta');

    for (var i = 0; i < collections.length; i++) {
      var meta = JSON.parse(collections[i].innerHTML);
      links.push(meta.ou);
    }
    return links;
  });
  console.log(result);
  phantom.exit();
});