var main = require('./handlers/main.js');
var contest = require('./handlers/contest.js');
var vacation = require('./handlers/vacation.js');
var contact = require('./handlers/contact.js');
var testing = require('./handlers/test.js');

module.exports = function(app) {

	app.get('/', main.home);
	app.get('/about', main.about);
	app.get('/newsletter', main.newsletter);
	app.get('/thank-you', main.genericThankYou);

	// contest routes
	app.get('/contest/vacation-photo', contest.vacationPhoto);
	app.post('/contest/vacation-photo/:year/:month', contest.vacationPhotoProcessPost);
	app.get('/contest/vacation-photo/entries', contest.vacationPhotoEntries);

	// vacation routes
	app.get('/vacations', vacation.list);
	app.get('/vacation/:vacation', vacation.detail);
	app.get('/notify-me-when-in-season', vacation.notifyWhenInSeason);
	app.post('/notify-me-when-in-season', vacation.notifyWhenInSeasonProcessPost);
	app.get('/set-currency/:currency', vacation.setCurrency);

	// contact
	app.get('/tours/request-group-rate', contact.requestGroupRate);

	// testing/sample routes
	app.get('/nursery-rhyme', testing.nurseryRhyme);
	app.get('/data/nursery-rhyme', testing.nurseryRhymeData);
	app.get('/test-form', testing.testForm);
	app.post('/test-form', testing.testFormProcess);
	app.get('/headers', testing.headers);
	app.get('/fail', testing.fail);
	app.get('/epic-fail', testing.epicFail);
	app.get('/foo', testing.fooFirst, testing.fooSecond, testing.fooLast);

};
