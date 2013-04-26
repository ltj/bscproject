
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

/*
 * GET test page.
 */

exports.test = function(req, res){
  res.render('test', { title: 'Test'});
};

/*
 * GET dashboard.
 * Set to page currently in use (testing)
 */

exports.dash = function(req, res){
  res.render('dashng', { title: 'Dashboard' });
};