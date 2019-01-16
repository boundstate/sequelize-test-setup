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

  options = Object.assign({
    truncate: true
  }, options);

  var sequelize = options.sequelize;
  var queryInterface = options.sequelize.getQueryInterface();

  // Set up test database and load fixtures
  return runMigrations().then(function () {
    return destroyModels();
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
        if (options.models[modelName] instanceof sequelize.Model) {
          return options.models[modelName].destroy({
            where: Sequelize.literal('1=1'),
            truncate: options.truncate,
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
    return sequelizeFixtures.loadFiles(options.fixtures, options.models, {
      log: function () {}
    });
  }
};
