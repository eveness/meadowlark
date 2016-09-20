module.exports = function(grunt){

	[
		'grunt-cafe-mocha',
		'grunt-contrib-jshint',
		'grunt-exec',
		'grunt-contrib-less',
	].forEach(function(task){
		grunt.loadNpmTasks(task);
	});

	grunt.initConfig({
		cafemocha: {
			all: { src: 'qa/tests-*.js', options: { ui: 'tdd' }, }
		},
		jshint: {
			app: ['app.js', 'app_cluster.js', 'public/js/**/*.js', 'lib/**/*.js', 'models/**/*.js', 'handlers/**/*.js'],
			qa: ['Gruntfile.js', 'public/qa/**/*.js', 'qa/**/*.js'],
		},
		exec: {
			linkchecker: { cmd: 'c:/utils/linkchecker/linkchecker http://localhost:3000' }
		},
		less: {
			development: {
				options: {
					customFunctions: {
						static: function(lessObject, name) {
							return 'url(" ' + require('./lib/static.js').map(name.value) + '")';
						}
					}
				},
				files: {
					'public/css/style.css': 'less/main.less'
				}
			}
		}
	});

	grunt.registerTask('default', ['jshint','exec','cafemocha']);
};