var VALID_EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

exports.nurseryRhyme = function(req, res){
	res.render('nursery-rhyme');
};

exports.nurseryRhymeData = function(req, res){
	res.json({
		animal: 'бельчонок',
		bodyPart: 'хвост',
		adjective: 'пушистый',
		noun: 'черт',
	});
};

// форма для проверки работы сессий
exports.testForm = function(req, res) {
	res.render('test-form', { csrf: 'CSRF token' });
};

exports.testFormProcess = function(req, res) {
	var name = req.body.name || '',
		email = req.body.email || '';
	if(!email.match(VALID_EMAIL_REGEX)) {
		req.session.flash = {
			intro: 'Ошибка проверки!',
			message: 'Адрес электронной почты некорректен.'
		};
		return res.redirect(303, '/test-form');
	}
	// TODO сохранение данных о подписчике
	// пример с.137
	return res.render('thank-you');
};

exports.headers = function(req, res) {
	res.set('Content-Type', 'text/plain');
	var s = '';
	for (var name in req.headers) {
		s += name + ': ' + req.headers[name] + '\n';
	}
	res.send(s);
};

exports.fail = function(req, res) {
	throw new Error('Нет!');
};

exports.epicFail = function(req, res) {
	process.nextTick(function() {
		throw new Error('Бабах!');
	});
};

exports.fooFirst = function(req, res, next) {
	if(Math.random() < 0.33) return next();
	res.send('красный');
};
exports.fooSecond = function(req, res, next) {
	if(Math.random() < 0.5) return next();
	res.send('зеленый');
};
exports.fooLast = function(req, res) {
	res.send('синий');
};
