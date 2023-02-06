import {Sequelize, DataTypes} from 'sequelize';

const config = {
    host: process.env.SQL_HOST,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DATABASE
}

const sequelize = new Sequelize(config.database, config.user, config.password, {
    host: config.host,
    dialect: 'mariadb',
    // logging: false
});

export const Item = sequelize.define('Item', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
    },
    name: {
        type: DataTypes.TEXT,
    },
    rap: {
        type: DataTypes.BIGINT,
    },
    value: {
        type: DataTypes.BIGINT,
    },
    details: {
        type: DataTypes.JSON,
    },
    thumbnail: {
        type: DataTypes.TEXT,
    },
    resaleData: {
        type: DataTypes.JSON
    },
    marketplace: {
        type: DataTypes.JSON
    }
})

export const getItems = () =>
    Item.findAll({});

try {
    await sequelize.authenticate();
    if (process.env.SET_SCHEMA)
        await sequelize.sync({alter: true});
    console.log('Connection to database established successfully');
} catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit();
}
