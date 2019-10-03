const express = require('express');
const app = express();

app.get('/', (request, response) => {
  response.sendFile(`${__dirname}/index.html`);
});

app.use(express.static(`${__dirname}/`, {
  etag: false
}));

const server = app.listen(7000, () => {
  console.log(`Express running http://localhost:${server.address().port}`);
});