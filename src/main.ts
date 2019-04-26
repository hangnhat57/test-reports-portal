import * as path from 'path';
import * as express from 'express';
import * as morgan from 'morgan';
require("dotenv").config();
const port = process.env.PORT||3000;
import * as config from 'config';

let app;

const { readdirSync, statSync } = require('fs')
const { join } = require('path')
var dirs = p => readdirSync(p).filter(f => statSync(join(p, f)).isDirectory())
var categories = dirs(path.join(__dirname, '..', 'uploads'))

async function bootstrap() {
  app = express();
  app.use(morgan('dev'));

  // Point static path to dist
  app.use(express.static(path.join(__dirname, '..', 'uploads')));
  app.use(express.static(path.join(__dirname, '..', 'vendor')));

  // main route
  app.get('/', (req, res) => {
    let types = dirs(path.join(__dirname, '..', 'uploads'))
    const links = types.map((link) => {
      return `
      <div class="card text-white bg-success mb-3 col-sm-4 col-md-5" style="margin:auto" >
        <div class="card-header text-center">${link}</div>
        <div class="card-body">
          <a href="${link}" class="btn-block btn btn-dark">Open</a>
        </div>
      </div>
     `;
    }).join('');
    res.send(`
  <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <base href="/">
        <link rel="stylesheet" href="bootstrap.min.css">
        <title>Test Reports Portal</title>
      </head>
      <body>
        <div class="row">
          <div class="col-xs-12 mx-auto">
            <h1 class=" text-success">Test Reports Portal</h1>
          </div>
        </div>
        <div class="row" style="margin-bottom:20px">
          ${links}
        </div>
      </body>
    </html>
`);
  });



  // set dynamic routes
  await categories.forEach(category => {
    app.use(`/${category}`, (req, res) => {
      let reportNames = dirs(path.join(__dirname, '..', 'uploads', category));
      let urls = reportNames.map((url) => {
        app.use(express.static(path.join(__dirname, '..', 'uploads', category, url)));
        return `
      <tr>
      <td>${url}</td>
      <td><a href="${category}/${url}" class="btn btn-success">Open</a></td>
      </tr>
       `;
      }).join('');
      res.send(`
    <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <base href="/">
          <link rel="stylesheet" href="bootstrap.min.css">
          <title>Test Reports Portal - ${category}</title>
        </head>
        <body>
          <div class="row">
            <div class="col-xs-12 mx-auto">
              <h1 class=" text-success">Automation Test Reports Portal : ${category}</h1>
            </div>
          </div>
          <table class="table table-dark table-hover table-bordered col-sm-10" style="margin:auto">
          <thead>
            <tr>
              <th class = "col-sm-8" scope="col">Name</th>
              <th class = "col-sm-4" scope="col">Link</th>
            </tr>
          </thead>
          <tbody>
          
            ${urls}
          
          </tbody>
        </body>
      </html>
`);
    });


    let reportNames = dirs(path.join(__dirname, '..', 'uploads', category));
    reportNames.forEach(reportName => {
      app.use(`/${category}/${reportName}`, (req, res) => {

        res.sendFile(path.resolve(path.join(__dirname, '../uploads', `${category}/${reportName}/index.html`)));

      });
    })

  });
  
await app.listen(port);}


bootstrap();