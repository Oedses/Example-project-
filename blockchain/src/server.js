const Koa = require('koa');
const koaBody = require('koa-body');
const api = require('./routes');
const database = require('./database');
const {PORT} = require('./config');
const { errorHandler } = require("./middleware");

module.exports = async function () {
  await database.init();

  new Koa()
      .use(koaBody({formLimit: '500kb'}))
      .use(errorHandler)
      .use(api.routes())
      .listen(PORT, () => console.log(`Server listening on port: ${PORT}`));
};
