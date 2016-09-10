var fortune = require('../lib/fortune.js');

exports.home = function(req, res) {
	res.render('home');
};

exports.about = function(req, res) {
	res.render('about', {
		fortune: fortune.getFortune(),
		pageTestScript: '/qa/tests-about.js'
	});
};

exports.newsletter = function(req, res) {
	res.render('newsletter', { csrf: 'CSRF token' });
};

exports.genericThankYou = function(req, res) {
	res.render('thank-you');
};
