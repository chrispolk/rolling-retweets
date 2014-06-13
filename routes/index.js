/*
 * GET home page.
 */

exports.index = function(req, res) {
  res.render('index', { title: 'Top 10 Retweets Stream' });
};
