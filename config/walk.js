'use strict';

/**
 * Module dependencies.
 */


/**
 * Module init function.
 */
module.exports = (function () {

    var walk = require('walk'),
        fs = require('fs'),
        path = require('path'),
        config = require('../config/config'),
        chalk = require('chalk'),
        id3 = require('id3_reader'),
        errorHandler = require('../app/controllers/errors.server.controller'),
        tracks = require('../app/controllers/tracks.server.controller');

    var options = {
        filters: ['@eaDir'],
        listeners: {
            //names: function (root, nodeNamesArray) {
            //    nodeNamesArray.sort(function (a, b) {
            //        if (a > b) return 1;
            //        if (a < b) return -1;
            //        return 0;
            //    });
            //}
            //, directories: function (root, dirStatsArray, next) {
            //    dirStatsArray.forEach(function (stat) {
            //        if (!stat.name.match(/(@eaDir)/)) {
            //            //console.log('Reading folder ' + path.basename(root), stat.name);
            //            console.log(' Reading folder ' + path.resolve(root, stat.name));
            //        }
            //    });
            //    next();
            //}
            //,
            file: function (root, fileStats, next) {
                if (fileStats.name.match(/(?:mp3)/)) {
                    var path = root + '/' + fileStats.name;
                    // tracks.upsert({'path': path}, {'path': path});
                    id3.read(path, function(err, meta) {
                        if (err) {
                            return errorHandler.getErrorMessage(err);
                        } else {
                            //console.log(meta.artist, meta.title, meta.genre, path);
                            tracks.upsert({'path': path}, meta);
                        }
                    });
                }
                next();
            },
            errors: function (root, nodeStatsArray, next) {
                nodeStatsArray.forEach(function (n) {
                    //console.error(chalk.red('[ERROR] ' + n.name));
                    console.error(chalk.red(n.error.message || (n.error.code + ': ' + n.error.path)));
                });
                next();
            }
        }
    };

    console.log(chalk.green('Started walker in ' + config.walkPath));
    var walker = walk.walkSync(config.walkPath, options);

    console.log(chalk.green('Walker finished.'));
}());
