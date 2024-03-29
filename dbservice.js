require('dotenv').config()

let types = require('pg').types
types.setTypeParser(20, function (val) {
  return parseInt(val)
})

console.log(process.env.DATABASE_URL)
let knex = require('knex')({
  client: 'pg',
  version: '9.6',
  connection: {
    // host: process.env.DB_HOST,
    // user: process.env.DB_USER,
    // password: process.env.DB_PASSWORD,
    // database: process.env.DB_DATABASE,
    // port: process.env.DB_PORT,
    connectionString: process.env.DATABASE_URL,
    ssl:{rejectUnauthorized:false}
  },
  pool: { min: 0, max: 7 }
});

knex.raw("SELECT 1;").then(() => {
  console.log(`Success in connecting to the database`)
}).catch((err) => {
  console.error(`Error in connecting to the database: ${err}`)
  process.exit()
})

module.exports = knex