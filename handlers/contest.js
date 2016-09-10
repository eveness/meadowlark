var fs = require('fs');
var path = require('path');
var formidable = require('formidable');

var dataDir = path.normalize(path.join(__dirname, '..', 'data'));
var vacationPhotoDir = path.join(dataDir, 'vacation-photo');

try {
	fs.statSync(dataDir);
} catch (e) {
	fs.mkdirSync(dataDir);
}
try {
	fs.statSync(vacationPhotoDir);
} catch (e) {
	fs.mkdirSync(vacationPhotoDir);
}

function saveContestEntry(contestName, email, year, month, photoPath) {
	// TODO
}

exports.vacationPhoto = function(req, res) {
	var now = new Date();
	res.render('contest/vacation-photo', {
		year: now.getFullYear(),
		month: now.getMonth()
	});
};

exports.vacationPhotoProcessPost = function(req, res) {
	var form = new formidable.IncomingForm();
	form.parse(req, function(err, fields, files) {
		if(err) {
			req.session.flash = {
				type: 'danger',
				intro: 'Упс!',
				message: 'Во время обработки отправленной Вами формы произошла ошибка. Пожалуйста, попробуйте ещё раз.'
			};
			return res.redirect(303, '/error');
		}
		var photo = files.photo;
		var dir = vacationPhotoDir + '/' + Date.now();
		var path = dir + '/' + photo.name;
		fs.mkdirSync(dir);
		fs.renameSync(photo.path, dir + '/' + photo.name);
		saveContestEntry('vacation-photo', fields.email, req.params.year, req.params.month, path);
		req.session.flash = {
			type: 'success',
			intro: 'Удачи!',
			message: 'Вы стали участником конкурса.'
		};
		return res.redirect(303, '/contest/vacation-photo/entries');
	});
};

exports.vacationPhotoEntries = function(req, res) {
	res.render('contest/vacation-photo/entries');
};
