import * as path from 'path';
import * as express from 'express';
import * as morgan from 'morgan';

import * as config from 'config';

let app;

const { readdirSync, statSync } = require('fs')
const { join } = require('path')
const dirs = p => readdirSync(p).filter(f => statSync(join(p, f)).isDirectory())

async function bootstrap() {
  app = express();
  app.use(morgan('dev'));

  // Point static path to dist
  app.use(express.static(path.join(__dirname, '..', 'uploads')));
  app.use(express.static(path.join(__dirname, '..', 'vendor')));

  // main route
  app.get('/', (req, res) => {

    const links = config.get('routes').map((link) => {

      const urls = dirs(path.join(__dirname, '..', 'uploads', link)).map((url) => {
        app.use(express.static(path.join(__dirname, '..', 'uploads',link,url)));

        return `
        <td>
        <div class="col-sm-12 ">
          <div class="card col-sm-5">
            <div class="card-body text-center">
              <h5 class="card-title">
                  ${link} - ${url}
              </h5>
              <a href="${link}/${url}" class="btn btn-primary">Report</a>
            </div>
          </div>
        </div></td>`;
      }).join('');

      res.send(`
    <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <base href="/">
          <link rel="stylesheet" href="bootstrap.min.css">
        </head>
        <body>
          <div class="row">
            <div class="col-xs-12 mx-auto">
              <h1>Automation Test Reports Portal</h1>
            </div>
          </div>
          <div class="row">
            ${urls}
          </div>
        </body>
      </html>
`);
    })

  });

  // set dynamic routes
  await config.get('routes').forEach(project => {

    console.log(`project: ${project} loaded`);

    app.use(`/${project}`, (req, res) => {
      let name = require('url').parse(req.url, true).query.name;
      res.sendFile(path.resolve(path.join(__dirname, '../uploads', `${project}/${name}/index.html`)));
    });
  });

  await app.listen(config.get('port'));
}

bootstrap();