module.exports = function(grunt){

	[
		'grunt-cafe-mocha',
		'grunt-contrib-jshint',
		'grunt-exec',
		'grunt-lint-pattern',
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
		lint_pattern: {
			views_static: {
				options: {
					rules: [
						{
							pattern: /<link [^>]*href=["'](?!\{\{static )/,
							message: 'В <link> обнаружен статический ресурс, которому не установлено соответствие.'
						},
						{
							pattern: /<script [^>]*src=["'](?!\{\{static )/,
							message: 'В <script> обнаружен статический ресурс, которому не установлено соответствие.'
						},
						{
							pattern: /<img [^>]*src=["'](?!\{\{static )/,
							message: 'В <img> обнаружен статический ресурс, которому не установлено соответствие.'
						}
					]
				},
				files: {
					src: ['views/**/*.handlebars']
				}
			},
			css_statics: {
				options: {
					rules: [
						{
							pattern: /url\(/,
							message: 'В <link> обнаружен статический ресурс, которому не установлено соответствие.'
						}
					]
				},
				files: {
					src: ['less/**/*.less']
				}
			}
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

	grunt.registerTask('default', ['jshint','exec','cafemocha','lint_pattern']);
};