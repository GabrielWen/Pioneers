module.exports = function(config) {
  config.set({

    basePath : './',

    files : [
      'http://ajax.googleapis.com/ajax/libs/angularjs/1.4.9/angular.js',
      'ts_output_readonly_do_NOT_change_manually/src/gameLogic.js',
      'ts_output_readonly_do_NOT_change_manually/src/common.js',
      'ts_output_readonly_do_NOT_change_manually/src/aiService.js',
      'http://yoav-zibin.github.io/emulator/dist/turnBasedServices.3.js',
      'ts_output_readonly_do_NOT_change_manually/src/gameLogic_test.js'
    ],

    reporters: ['progress', 'coverage'],

    preprocessors: {
      // Source files, that you wanna generate coverage for.
      // (these files will be instrumented by Istanbul)
      // Do not include tests or libraries.
      'ts_output_readonly_do_NOT_change_manually/src/gameLogic.js': ['coverage'],
      'ts_output_readonly_do_NOT_change_manually/src/common.js': ['coverage']
    },

    // optionally, configure the reporter
    coverageReporter: {
      type : 'html',
      dir : 'coverage/'
    },

    autoWatch : true,

    frameworks: ['jasmine'],

    browsers : ['Chrome'],

    plugins : [
            'karma-chrome-launcher',
            'karma-jasmine',
            'karma-coverage'
            ]

  });
};
