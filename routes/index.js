
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express' })
};
exports.bookmark = function(req, res){
  res.render('bookmark', { title: 'Express' })
};