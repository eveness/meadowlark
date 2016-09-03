var cluser = require('cluster');

function startWorker() {
	var worker = cluser.fork();
	console.log('КЛАСТЕР: Исполнитель %d запущен', worker.id);
}

if(cluser.isMaster) {
	require('os').cpus().forEach(function() {
		startWorker();
	});
	// записываем в журнал всех отключившихся исполнителей:
	// если исполнитель отключается, он должен затем
	// завершить работу, так что мы подождем
	// событие завершения работы для порождения
	// нового исполнителя ему на замену
	cluser.on('disconnect', function(worker) {
		console.log('КЛАСТЕР: Исполнитель %d отключился от кластера',
			worker.id);
	});
	// когда исполнитель завершает работу,
	// создаем исполнителя ему на замену
	cluser.on('exit', function(worker, code, signal) {
		console.log('КЛАСТЕР: Исполнитель %d завершил работу ' +
			'с кодом завершения %d (%s)', worker.id, code, signal);
		startWorker();
	});
} else {
	// запускаем наше приложение на исполнителе
	require('./app.js')();
}