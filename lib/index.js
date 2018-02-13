var _ = require('lodash');
var Sequelize = require('sequelize');
var sequelizeFixtures = require('sequelize-fixtures');
var Umzug = require('umzug');

/**
 * Sets up test database and loads fixtures
 * @param {Object} options
 * @param {Sequelize} options.sequelize Sequelize instance
 * @param {string} options.migrationsPath path to Sequelize migrations
 * @param {string[]} options.fixtures filenames to be loaded by sequelize-fixtures
 * @param {Model[]} options.models Sequelize models to be loaded by sequelize-fixtures
 * @param {boolean} [options.truncate=true]
 * @returns {Promise}
 */
module.exports = function (options) {

  options = _.defaults(options, {
    truncate: true
  });

  var sequelize = options.sequelize;
  var queryInterface = options.sequelize.getQueryInterface();

  // Set up test database and load fixtures
  return runMigrations().then(function () {
    return sequelize.query("SET FOREIGN_KEY_CHECKS = 0")
  }).then(function () {
    return destroyModels();
  }).then(function () {
    return sequelize.query("SET FOREIGN_KEY_CHECKS = 1")
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
   * Destroys all model rows.
   * @returns {Promise}
   */
  function destroyModels() {
    return Sequelize.Promise.each(
      Object.keys(options.models), function (modelName) {
        return options.models[modelName].destroy({
          truncate: options.truncate,
          cascade: true,
          force: true
        });
      }
    );
  }

  /**
   * Loads fixtures from `fixtures` folder.
   * @returns {Promise}
   */
  function loadFixtures() {
    return sequelizeFixtures.loadFiles(options.fixtures, options.models, {log: _.noop});
  }
};