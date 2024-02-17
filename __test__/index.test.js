const request = require("supertest");
const app = require('../app');

describe('Test the budget app', () => {
  test("Get user's expenses today", async () => {
    const res = await request(app).get('/expense?userId=101010&onlyToday=1');
    expect(res.statusCode).toBe(200);
    expect(res.body).not.toEqual(null)
  });

  test("Get user's expenses of this week", async () => {
    const res = await request(app).get('/expense?userId=101010');
    expect(res.statusCode).toBe(200);
    expect(res.body).not.toEqual(null);
  });

  test("Get the comparison between user's expenses and average expenses", async () => {
    const res = await request(app).get('/differences?userId=101010');
    expect(res.statusCode).toBe(200);
    expect(res.body).not.toEqual(null);
  });

  test("Update or insert user's expenses of today", async () => {
    const res = (await request(app).post('/expense'))
    .send({userId: 101010, expenseData: { coffee: 20, food: 30, alcohol: 60}})
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json');
    expect(res.statusCode).toBe(200);
  })
})