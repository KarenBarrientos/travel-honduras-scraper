const express = require('express');
const router = express.Router();
const request = require('request');
const cheerio = require('cheerio');

const admin = require('firebase-admin');
const serviceAccount = require('../secreto.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://honduras-travel.firebaseio.com'
});

const db = admin.database();

router.get('/', function (req, res, next) {
  url = 'http://www.honduras.travel/';

  request(url, function (error, response, html) {
    if (error) {
      res.send('error');
      return;
    }

    const $ = cheerio.load(html);
    $('.dropdown').filter(function() {
      const data = $(this);
      const atractivos = data['0']
        .children
        .filter(child => child.name === 'ul')[0]
        .children
        .filter(child => child.name === 'li')
        .map(child => child.children[0])
        .map(child => ({
          name: child.children[0].data,
          url: child.attribs.href 
        }));

      console.log(atractivos);
      atractivos.forEach(atractivo => {
        db.ref('/atractivos/').push(atractivo).then((snap) => {
          request(atractivo.url, function (err, res, html) {
            if (err) {
              return;
            }
          
            const $ = cheerio.load(html);
            $('.carousel-inner').filter(function () {
              const idata = $(this);
          
              const lugares = [];
          
              idata['0']
                .children
                .map(child => child.children)
                .filter(child => child !== undefined)
                .forEach(child => lugares.push(...child));
          
              const result = lugares
                .filter(child => child.name === 'img')
                .map(child => child.attribs)
                .map(child => ({
                  src: `http://www.honduras.travel/${child.src}`,
                  lugar: child.alt.split('-')[1]
                }));

              result.forEach(lugar => {
                db.ref(`/atractivos/${snap.key}/`).push(lugar);
              });

              console.log(result);
              });
          });
        });
      });
      res.send('Revisar la consola');
    });
  });
});



module.exports = router;
