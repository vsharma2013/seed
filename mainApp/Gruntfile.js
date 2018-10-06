module.exports = function(grunt) {

    // 1. All configuration goes here 
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        configHTML: {
          src: 'web/v5/index.html',
          dist: 'web/build/index.html'
        },
        concat: {
            dist: {
                src: [
                    'web/v5/Fixtures/dataJson.js',

                    'web/v5/libsJS/jquery-2.1.4.min.js',
                    'web/v5/libsJS/bootstrap/js/bootstrap.min.js',
                    'web/v5/libsJS/handleBar/handlebars-v4.0.5.js',
                    'web/v5/libsJS/routie/routie.js',
                    'web/v5/libsJS/d3.min.js',
                    'web/v5/libsJS/fileupload/fileinput.min.js',
                    'web/v5/libsJS/bootstrap-select/bootstrap-select.min.js',
                    'web/v5/libsJS/underscore-min.js',
                    'web/v5/libsJS/noty/packaged/jquery.noty.packaged.min.js',
                    'web/v5/libsJS/tagsinput/jquery.tagsinput.min.js',
                    'web/v5/libsJS/jstree/jstree.min.js',
                    'web/v5/libsJS/bootstrap-confirmation/bootstrap-confirmation.js',
                    'web/v5/libsJS/nvd3/nv.d3.min.js',

                    'web/v5/main/js/hbUtils/hbUtils.js',
                    'web/v5/main/js/utils/responseParser.js',
                    'web/v5/main/js/utils/messages.js',
                    'web/v5/main/js/utils/utils.js',
                    'web/v5/main/js/utils/serviceRouter.js',
                    'web/v5/main/js/querySuggester/suggestionBuilder.js',
                    'web/v5/main/js/querySuggester/queryParser.js',
                    'web/v5/main/js/querySuggester/querySuggester.js',

                    'web/v5/uiLib/common/uiComponentsDictionary.js',
                    'web/v5/uiLib/charts/SimpleLineChart/simpleLineChart.js',
                    'web/v5/uiLib/charts/SimpleLineChart/simpleLineModel.js',
                    'web/v5/uiLib/charts/cummLineChart/cummLineChart.js',
                    'web/v5/uiLib/charts/cummLineChart/cummLineModel.js',
                    'web/v5/uiLib/charts/barChart/barChartNew.js',
                    'web/v5/uiLib/charts/barChart/barChartNewModel.js',
                    'web/v5/uiLib/charts/AreaChart/areaChart.js',
                    'web/v5/uiLib/charts/AreaChart/areaChartModel.js',
                    'web/v5/uiLib/charts/horBarChart/horBarChart.js',
                    'web/v5/uiLib/charts/horBarChart/horBarModel.js',
                    'web/v5/uiLib/charts/donutChart/donutChart.js',
                    'web/v5/uiLib/charts/donutChart/donutModel.js',
                    'web/v5/uiLib/charts/horBarChart/horBarModel.js',
                    'web/v5/uiLib/charts/horBarChart/horBarChart.js',
                    'web/v5/uiLib/charts/pieChart/pieChartModel.js',
                    'web/v5/uiLib/charts/pieChart/pieChart.js',
                    'web/v5/uiLib/charts/descreteBarChart/descreteBarModel.js',
                    'web/v5/uiLib/charts/descreteBarChart/descreteBarChart.js',
                    'web/v5/uiLib/charts/3dPie/3dPie.js',
                    'web/v5/uiLib/charts/lineChart/lineChart.js',
                    'web/v5/uiLib/charts/barChart/barChart.js',
                    'web/v5/uiLib/uiFactory.js',
                    'web/v5/uiLib/uiLib.js',


                    'web/v5/widget/model/SalesTimeModel.js',
                    'web/v5/widget/model/SalesTableModel.js',
                    'web/v5/widget/model/ModelFactory.js',
                    'web/v5/widget/model/chartModel.js',
                    'web/v5/widget/ui/widgetFrame.js',
                    'web/v5/widget/widget.js',

                    'web/v5/main/js/model/userModel.js',
                    'web/v5/main/js/model/queriesModel.js',
                    'web/v5/main/js/model/dataSetHierarchyModel.js',
                     'web/v5/main/js/model/sharedDashboardsModel.js',
                    'web/v5/main/js/model/dashboardsModel.js',
                    'web/v5/main/js/model/dataSetsModel.js',
                    'web/v5/main/js/model/appModel.js',


                    'web/v5/main/js/view/panelView.js',
                    'web/v5/main/js/view/search/pinPopupView.js',
                    'web/v5/main/js/view/search/searchDisplayView.js',
                    'web/v5/main/js/view/search/searchMainView.js',
                    'web/v5/main/js/view/dashboardPanelsView.js',
                    'web/v5/main/js/view/DashboardCrud/dashboardCrudView.js',
                    'web/v5/main/js/view/DataSetCrud/dataSetHierarchyEditor.js',
                    'web/v5/main/js/view/DataSetCrud/dataSetCrudView.js',
                    'web/v5/main/js/view/DataSetCrud/dataSetHierarchyView.js',
                    'web/v5/main/js/view/dataSetView.js',
                    'web/v5/main/js/view/dashboardsView.js',
                    'web/v5/main/js/view/appView.js',


                    'web/v5/main/js/controllers/searchCtrl.js',
                    'web/v5/main/js/controllers/dataSetsCtrl.js',
                    'web/v5/main/js/controllers/dashboardsCtrl.js',
                    'web/v5/main/js/controllers/mainCtrl.js',


                    'web/v5/main/js/routers/appRouter.js',
                    'web/v5/main/main.js'
                ],
                dest: 'web/build/<%= pkg.name %>.js',
            }
        },

        cssmin: {
          options: {
            shorthandCompacting: false,
            roundingPrecision: -1,
            relativeTo:'web/build/css'
          },
          target: {
            'dest':'web/build/css/<%= pkg.name %>.min.css',
            'src':['web/v5/main/css/svg.css','web/v5/libCSS/theme-default.css']
          }
        },

        copy: {
          main: {
            expand: true,
            flatten: true,
            cwd: 'web/v5/libCSS/fonts/',
            src: '**',
            dest: 'web/build/fonts/',
            filter: 'isFile'
          }
        },

        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: 'web/build/<%= pkg.name %>.js',
                dest: 'web/build/<%= pkg.name %>.min.js'
            }
        },

        'string-replace': {
          inline: {
            files: {
              '<%= configHTML.dist %>': '<%= configHTML.src %>'
            },
            options: {
              replacements: [
                // place files inline example
                {
                  pattern: '{{JStoken}}',
                  replacement: '<%= grunt.template.today("isoUtcDateTime") %>'
                },
                {
                  pattern: '{{CSStoken}}',
                  replacement: '<%= grunt.template.today("isoUtcDateTime") %>'
                },
                {
                    pattern: '<!--start PROD imports',
                    replacement: '<!--start PROD imports-->'
                },
                {
                    pattern: 'end PROD imports-->',
                    replacement: '<!--end PROD imports-->'
                },
                {
                    pattern: '<!--start DEV imports-->',
                    replacement: '<!--start DEV imports'
                },
                {
                    pattern: '<!--end DEV imports-->',
                    replacement: 'end DEV imports-->'
                },
                 {
                    pattern: '<!--start PROD CSS imports',
                    replacement: '<!--start PROD CSS imports-->'
                },
                {
                    pattern: 'end PROD CSS imports-->',
                    replacement: '<!--end PROD CSS imports-->'
                },
                {
                    pattern: '<!--start DEV CSS imports-->',
                    replacement: '<!--start DEV CSS imports'
                },
                {
                    pattern: '<!--end DEV CSS imports-->',
                    replacement: 'end DEV CSS imports-->'
                }
              ]
            }
          }
        }

    });

    // 3. Where we tell Grunt we plan to use this plug-in.
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-string-replace');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-copy');

    // 4. Where we tell Grunt what to do when we type "grunt" into the terminal.
    grunt.registerTask('cssminTask', ['cssmin','copy']);
    grunt.registerTask('default', ['concat','string-replace','cssminTask', 'uglify']);

};