var loadtest = require('loadtest');
var expect = require('chai').expect;
var program = require('commander');

program
  .version('0.0.1')
  .option('--req, --requests <n>', 'maxRequests', parseInt)
  .parse(process.argv);

var requests = program.requests || 50;

suite('Стрессовые тесты:', function() {
	test('Домашняя страница должна обрабатывать ' + requests + ' запросов в секунду',
		function(done) {
			this.timeout(5000);
			var options = {
				url: 'http://localhost:3000',
				concurrency: 4,
				maxRequests: requests
			};
			loadtest.loadTest(options, function(err, result) {
				expect(!err);
				expect(result.totalTimeSeconds).below(1);
				done();
			});
	});
});