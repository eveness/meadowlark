var express = require('express');
var formidable = require('formidable');
var jqupload = require('jquery-file-upload-middleware');
var fortune = require('./lib/fortune.js');
var weather = require('./lib/weather.js');
var credentials = require('./credentials.js');

var app = express();
app.set('port', process.env.PORT || 3000);

var handlebars = require('express-handlebars').create({
	defaultLayout: 'main',
    helpers: {
        section: function(name, options){
            if(!this._sections) this._sections = {};
            this._sections[name] = options.fn(this);
            return null;
        }
    }
});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

// использование доменов для обработки ошибок
app.use(function(req, res, next){
    // создаем домен для этого запроса
    var domain = require('domain').create();
    // обрабатываем ошибки на этом домене
    domain.on('error', function(err){
        console.error('ПЕРЕХВАЧЕНА ОШИБКА ДОМЕНА\n', err.stack);
        try {
            // отказобезопасное отключение через 5 секунд
            setTimeout(function(){
                console.error('Отказобезопасное отключение.');
                process.exit(1);
            }, 5000);

            // отключение от кластера
            var worker = require('cluster').worker;
            if(worker) worker.disconnect();

            // прекращение принятия новых запросов
            server.close();

            try {
                // попытка использовать маршрутизацию ошибок Express
                next(err);
            } catch(error){
                // если маршрутизация ошибок Express не сработала,
                // пробуем выдать текстовый ответ Node
                console.error('Сбой механизма обработки ошибок Express.\n',
                	error.stack);
                res.statusCode = 500;
                res.setHeader('content-type', 'text/plain');
                res.end('Ошибка сервера.');
            }
        } catch(error){
            console.error('Не могу отправить ответ 500.\n', error.stack);
        }
    });

    // добавляем объекты запроса и ответа в домен
    domain.add(req);
    domain.add(res);

    // выполняем оставшуюся часть цепочки запроса в домене
    domain.run(next);
});

// var nodemailer = require('nodemailer');
// var mailTransport = nodemailer.createTransport({
// 	host: 'smtp.gmail.com',
//     port: 465,
// 	auth: {
// 		user: credentials.gmail.user,
// 		pass: credentials.gmail.password
// 	}
// });
// mailTransport.sendMail({
// 	from: '"Meadowlark Travel" <info@meadowlarktravel.com>',
// 	to: 'joecustomer@gmail.com',
// 	subject: 'Ваш тур Meadowlark Travel',
// 	text: 'Спасибо за заказ поездки в Meadowlark Travel.' +
// 		' Мы ждем вас с нетерепнием!'
// }, function(err) {
// 	if(err) console.error('Невозможно отправить письмо: ' + err);
// });

app.use(express.static(__dirname + '/public'));

app.use(function(req, res, next) {
	res.locals.showTests = app.get('env') !== 'production' &&
		req.query.test === '1';
	next();
});

// loggers
switch(app.get('env')) {
	case 'development':
		app.use(require('morgan')('dev'));
		break;
	case 'production':
		app.use(require('express-logger')({
			path: __dirname + '/log/requests.log'
		}));
		break;
}

// middleware cookie parser and session
app.use(require('cookie-parser')(credentials.cookieSecret));
app.use(require('express-session')({
	resave: false,
	saveUninitialized: false,
	secret: credentials.cookieSecret
}));

// middleware parse url encoded body
app.use(require('body-parser').urlencoded({ extended: true }));

// middleware to add weather data to context
app.use(function(req, res, next) {
	if(!res.locals.partials) res.locals.partials = {};
 	res.locals.partials.weatherContext = weather.getWeatherData();
 	next();
});

app.use('/upload', function(req, res, next) {
	var now = new Date();
	jqupload.fileHandler({
		uploadDir: function() {
			return __dirname + '/public/uploads/' + now;
		},
		uploadUrl: function() {
			return '/uploads/' + now;
		}
	})(req, res, next);
});

// middleware flash messages from session
app.use(function(req, res, next) {
	res.locals.flash = req.session.flash;
	delete req.session.flash;
	next();
});

// обработка разными исполнителями (кластеризация)
app.use(function(req, res, next) {
	var cluster = require('cluster');
	if(cluster.isWorker) {
		console.log('Исполнитель %d получил запрос', cluster.worker.id);
	}
	next();
});

app.get('/', function(req, res) {
	res.render('home');
});

app.get('/about', function(req, res) {
	res.render('about', {
		fortune: fortune.getFortune(),
		pageTestScript: '/qa/tests-about.js'
	});
});

app.get('/tours/hood-river', function(req, res) {
	res.render('tours/hood-river');
});
app.get('/tours/oregon-coast', function(req, res) {
	res.render('tours/oregon-coast');
});

app.get('/tours/request-group-rate', function(req, res) {
	res.render('tours/request-group-rate');
});

app.get('/nursery-rhyme', function(req, res){
	res.render('nursery-rhyme');
});
app.get('/data/nursery-rhyme', function(req, res){
	res.json({
		animal: 'бельчонок',
		bodyPart: 'хвост',
		adjective: 'пушистый',
		noun: 'черт',
	});
});

app.get('/newsletter', function(req, res) {
	res.render('newsletter', { csrf: 'CSRF token' });
});
app.post('/process', function(req, res) {
	if(req.xhr || req.accepts('json,html') === 'json') {
		// при ошибке отправлять { error: 'описание ошибки' }
		res.send({ success: true });
	} else {
		// при ошибке перенаправлять на страницу ошибки
		res.redirect(303, '/thank-you');
	}
});
app.get('/thank-you', function(req, res) {
	res.render('thank-you');
});

// форма для проверки работы сессий
app.get('/test-form', function(req, res) {
	res.render('test-form', { csrf: 'CSRF token' });
});
var VALID_EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
app.post('/test-form', function(req, res) {
	var name = req.body.name || '',
		email = req.body.email || '';
	if(!email.match(VALID_EMAIL_REGEX)) {
		req.session.flash = {
			intro: 'Ошибка проверки!',
			message: 'Адрсе электронной почты некорректен.'
		};
		return res.redirect(303, '/test-form');
	}
	// TODO сохранение данных о подписчике
	// пример с.137
	return res.render('thank-you');
});

app.get('/contest/vacation-photo-jquery', function(req, res) {
	var now = new Date();
	res.render('contest/vacation-photo-jquery', {
		year: now.getFullYear(),
		month: now.getMonth()
	});
});
app.get('/contest/vacation-photo', function(req, res) {
	var now = new Date();
	res.render('contest/vacation-photo', {
		year: now.getFullYear(),
		month: now.getMonth()
	});
});
app.post('/contest/vacation-photo/:year/:month', function(req, res) {
	var form = new formidable.IncomingForm();
	form.parse(req, function(err, fields, files) {
		if(err) return res.redirect(303, '/error');
		console.log('recieved fields:');
		console.log(fields);
		console.log('recieved files:');
		console.log(files);
		res.redirect(303, '/thank-you');
	});
});

app.get('/headers', function(req, res) {
	res.set('Content-Type', 'text/plain');
	var s = '';
	for (var name in req.headers) {
		s += name + ': ' + req.headers[name] + '\n';
	}
	res.send(s);
});

app.get('/fail', function(req, res) {
	throw new Error('Нет!');
});

app.get('/epic-fail', function(req, res) {
	process.nextTick(function() {
		throw new Error('Бабах!');
	});
});

app.use(function(req, res, next) {
	res.status(404).render('404');
});

app.use(function(err, req, res, next) {
	console.error(err.stack);
	res.status(500).render('500');
});

function startServer() {
	app.listen(app.get('port'), function() {
		console.log('Express запущен в режиме ' + app.get('env') +
			' на http://localhost:' + app.get('port'));
	});
}

if(require.main === module) {
	// приложение запускается непосредственно:
	// запускаем сервер приложения
	startServer();
} else {
	// приложение импортируется как модуль
	// посредством "require":
	// экспортируем функцию для создания сервера
	module.exports = startServer;
}