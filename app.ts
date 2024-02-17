const express = require('express');
const { router } = require("./routes/user.routes");
const cors = require('cors');
const bodyParser = require('body-parser');
const app  = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use("/", router);

module.exports = app ;