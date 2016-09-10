var express = require('express');
var weather = require('./lib/weather.js');
var credentials = require('./credentials.js');
var mongoose = require('mongoose');
var opts = {
	server: {
		socketOption: { keepAlive: 1 }
	}
};
var vhost = require('vhost');

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

var admin = express.Router();
app.use(vhost('admin.*', admin));
admin.get('/', function(req, res) {
	res.set('Content-Type', 'text/plain');
	res.send('Adiministration');
});

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
		mongoose.connect(credentials.mongo.development.connectionString, opts);
		break;
	case 'production':
		app.use(require('express-logger')({
			path: __dirname + '/log/requests.log'
		}));
		mongoose.connect(credentials.mongo.production.connectionString, opts);
		break;
	default:
		throw new Error('Неизвестная среда выполнения: ' + app.get('env'));
}

// middleware cookie parser and session
var MongoSessionStore = require('session-mongoose')(require('connect'));
var sessionStore = new MongoSessionStore({ url: credentials.mongo[app.get('env')].connectionString });

app.use(require('cookie-parser')(credentials.cookieSecret));
app.use(require('express-session')({
	resave: false,
	saveUninitialized: false,
	secret: credentials.cookieSecret,
	store: sessionStore
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

require('./routes.js')(app);

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
