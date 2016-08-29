var express = require('express');
var fortune = require('./lib/fortune.js');
var weather = require('./lib/weather.js');

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

app.use(express.static(__dirname + '/public'));

app.use(function(req, res, next) {
	res.locals.showTests = app.get('env') !== 'production' &&
		req.query.test === '1';
	next();
});

// middleware parse url encoded body
app.use(require('body-parser').urlencoded({ extended: true }));

// middleware to add weather data to context
app.use(function(req, res, next) {
	if(!res.locals.partials) res.locals.partials = {};
 	res.locals.partials.weatherContext = weather.getWeatherData();
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
	console.log('Form (from querystring): ' + req.query.form);
	console.log('CSRF token (from hidden form field): ' + req.body._csrf);
	console.log('Name (from visible form field): ' + req.body.name);
	console.log('Email (from visible form field): ' + req.body.email);
	res.redirect(303, '/thank-you');
});
app.get('/thank-you', function(req, res) {
	res.render('thank-you');
});

app.get('/headers', function(req, res) {
	res.set('Content-Type', 'text/plain');
	var s = '';
	for (var name in req.headers) {
		s += name + ': ' + req.headers[name] + '\n';
	}
	res.send(s);
});

app.use(function(req, res, next) {
	res.status(404);
	res.render('404');
});

app.use(function(err, req, res, next) {
	console.log(err.stack);
	res.status(500);
	res.render('500');
});

app.listen(app.get('port'), function() {
	console.log('Express запущен на http://localhost:' + app.get('port'));
});