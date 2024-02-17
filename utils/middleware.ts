import { Request, Response, NextFunction} from 'express';
const connection = require('../database/dbConnection.ts');

async function authenticate (req:Request, res:Response, next: NextFunction) {
  const result = await connection.query(`select * from users where id = ${req.query.userId}`);

  if (result.rows.length === 0) {
    res.status(400).send('Your access is denied!');
  }

  next();
}

module.exports ={
  authenticate,
}