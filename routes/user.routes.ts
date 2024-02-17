import { Router, Response } from "express";
import { Query } from 'express-serve-static-core';
const middleware = require('../utils/middleware');
const db = require('../database/dbConnection');

const router = Router();

interface TypedRequestQuery<T extends Query> extends Express.Request {
  query: T
}

router.get('/expense', middleware.authenticate, async (req:TypedRequestQuery<{userId: string, onlyToday:string}>, res:Response) => {
    try {
      const { userId, onlyToday } = req.query;
  
      let queryString;
      let expenses;
  
      if (onlyToday) {
        queryString = `select * from user_expense where user_id=${userId} and date = current_date`;
        const result = await db.query(queryString);
        expenses = result.rows.reduce((acc:{[key:string]: number}, current: {[key:string]: number}) => ({
          ...acc,
          [current.expense_type]: current.amount
        }), {});
      } else {
        queryString = `select expense_type, sum(amount) as amount_sum from user_expense where user_id=${userId} and date > (current_date - 7) group by expense_type`;
        const result = await db.query(queryString);
        expenses = result.rows.reduce((acc:{[key:string]: number}, current: {[key:string]: number}) => ({
          ...acc,
          [current.expense_type]: current.amount_sum
        }), {});
      }
  
      res.json(expenses);
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
  });

router.get('/differences', middleware.authenticate, async (req: TypedRequestQuery<{userId: string}>, res:Response) => {
  try {
    const {userId} = req.query;

    const queryString = `select temp1.expense_type, round((cast ((amount_sum - all_avg_expense) as float)/ all_avg_expense) * 100) as diff from 
    (select expense_type, sum(amount) as amount_sum from user_expense where user_id=${userId} and date > (current_date - 7) group by expense_type) as temp1
    join
    (select expense_type, (amount_sum / user_num) as all_avg_expense from 
    (select expense_type, sum(amount) as amount_sum from user_expense where date > (current_date - 7) group by expense_type) as temp2,
    (select count(distinct user_id) as user_num from user_expense where date > (current_date - 7)) as temp3) as temp4
    on temp1.expense_type = temp4.expense_type`
    
    const result = await db.query(queryString);
    const diffs = result.rows.reduce((acc: { [key:string]: number}, current: {[key:string]: number}) => ({
      ...acc,
      [current.expense_type]: current.diff
    }), {});

    res.json(diffs);

  } catch(err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

interface TypedRequestBody extends Express.Request {
  body: {
    userId: number,
    expenseData: {
      [key:string]: number,
    }
  }
}

router.post('/expense', middleware.authenticate, async (req:TypedRequestBody, res:Response) => {
  type expenseType = { [key: string]: number};
  const expenseData:expenseType = req.body.expenseData;
  
  try {
    for (const [key,value] of Object.entries(expenseData)) {
      if (value > 0) {
        const userId = req.body.userId;
        const result = await db.query(`select * from user_expense where user_id = ${userId} and expense_type = '${key}' and date = current_date`);
        if (result.rows.length === 0) {
          await db.query(`insert into user_expense values ($1, current_date, $2, $3)`, [userId, key, value]);
        } else {
          await db.query(`update user_expense set amount=${value} where user_id=${userId} and expense_type = '${key}' and date = current_date`);
        }
      }
    };
    res.status(200).json('Expense has successfully been inserted or updated!');
  } catch(err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = { router } 