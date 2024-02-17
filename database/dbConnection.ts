const { Pool } = require('pg');

const client = new Pool({
  user: 'postgres',
  password: 'postgres',
  host: 'localhost',
  port: 5432,
  database: 'budget'
});

module.exports = {
  query: (text:string, params: Array<any>) => client.query(text, params)
}