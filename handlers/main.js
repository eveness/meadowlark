var fortune = require('../lib/fortune.js');
var VALID_EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

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
	res.render('newsletter');
};

exports.newsletterProcessPost = function(req, res) {
	var name = req.body.name || '',
		email = req.body.email || '';
	if(!email.match(VALID_EMAIL_REGEX)) {
		req.session.flash = {
			intro: 'Ошибка проверки!',
			message: 'Адрес электронной почты некорректен.'
		};
		return res.redirect(303, '/newsletter');
	}
	console.log(email);
	// TODO сохранение данных о подписчике
	// пример с.137
	return res.redirect(303, '/thank-you');
};

exports.genericThankYou = function(req, res) {
	res.render('thank-you');
};
