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
    return truncateTables();
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
   * Truncates all tables in the test database.
   * @returns {Promise}
   */
  function truncateTables() {
    return sequelize.query('SET FOREIGN_KEY_CHECKS=0').then(function () {
      return queryInterface.showAllTables();
    }).each(function (tableName) {
      // don't truncate the migrations table
      if (tableName.toLowerCase() != 'sequelizemeta') {
        return sequelize.query('TRUNCATE ' + tableName);
      }
    }).then(function () {
      return sequelize.query('SET FOREIGN_KEY_CHECKS=1');
    });
  }

  /**
   * Loads fixtures from `fixtures` folder.
   * @returns {Promise}
   */
  function loadFixtures() {
    return sequelizeFixtures.loadFiles(options.fixtures, options.models, {log: noop});
  }
};