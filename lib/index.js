var Sequelize = require('sequelize');
var sequelizeFixtures = require('sequelize-fixtures');
var Umzug = require('umzug');

var noop = function(){};

/**
 * Sets up test database and loads fixtures
 * @param {Object} options
 * @param {Sequelize} options.sequelize Sequelize instance
 * @param {string} options.migrationsPath path to Sequelize migrations
 * @param {string[]} options.fixtures filenames to be loaded by sequelize-fixtures
 * @param {Model[]} options.models Sequelize models to be loaded by sequelize-fixtures
 * @returns {Promise}
 */
module.exports = function (options) {

  var sequelize = options.sequelize;
  var queryInterface = options.sequelize.getQueryInterface();

  // Set up test database and load fixtures
  return runMigrations().then(function () {
    return truncateModels();
  }).then(function () {
    return loadFixtures();
  });

  /**
   * Runs migrations on test database.
   * @returns {Promise}
   */
  function runMigrations() {
    var umzug = new Umzug({
      storage: 'sequelize',
      storageOptions: {
        sequelize: sequelize
      },
      migrations: {
        params: [queryInterface, Sequelize],
        path: options.migrationsPath
      }
    });
    return umzug.up();
  }

  /**
   * Truncates all models
   * @returns {Promise}
   */
  function truncateModels() {
    return Sequelize.Promise.each(
      Object.keys(options.models), function (modelName) {
        if (options.models[modelName] instanceof sequelize.Model) {
          return options.models[modelName].truncate({
            cascade: true,
            force: true
          });
        }
      }
    );
  }

  /**
   * Loads fixtures from `fixtures` folder.
   * @returns {Promise}
   */
  function loadFixtures() {
    return sequelizeFixtures.loadFiles(options.fixtures, options.models, {log: noop});
  }
};