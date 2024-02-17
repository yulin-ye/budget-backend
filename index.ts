const db = require('./database/dbConnection');
const application = require('./app');
const port = 3001;

application.listen(port, () => {
  console.log(`listening on port ${port}`);
});
