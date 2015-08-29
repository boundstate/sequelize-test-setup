# Sequelize Test Setup

Tool for setting up a test database and loading fixtures with [Sequelize].

It runs migrations and destroys all models before loading the fixtures via [sequelize-fixtures].

## Install

```sh
npm install sequelize-test-setup
```

## Usage

```sh
var sequelizeTestSetup = require('sequelize-test-setup');
var models = require('./models');
sequelizeTestSetup({
  sequelize: models.sequelize,
  models: models,
  migrationsPath: 'migrations',
  fixtures: ['fixtures/test_data.json']
});
```

## Options

- `sequelize` *Sequelize* - Sequelize instance
- `models` *Array* - Sequelize models
- `migrationsPath` *String* - path to migrations
- `fixtures` *Array* - fixture filenames to load via [sequelize-fixtures]
- `truncate` *Boolean* - use TRUNCATE instead of DELETE queries (default: `true`)

## Tips

MySQL does not support using TRUNCATE TABLE for an InnoDB table if there are any FOREIGN KEY constraints.  If you get `ER_TRUNCATE_ILLEGAL_FK` errors you should set `truncate` to `false` to use DELETE queries instead.

[Sequelize]: http://sequelizejs.com
[sequelize-fixtures]: https://github.com/domasx2/sequelize-fixtures
