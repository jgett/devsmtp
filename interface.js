
// change this if needed
var port = 3001;

const express = require('express');
const app = express();

app.use(express.static('static'));

const server = app.listen(port, () => {
  console.log(`devsmtp web interface server listening on port ${port}`)
});