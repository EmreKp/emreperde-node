const express = require('express')
const bodyParse = require('body-parser')
const multer = require('multer')
const request = require('request')
const filesys = require('fs')
const md5 = require('js-md5')
const atici = multer({ dest: 'imaj/'})
const mongo = require('mongodb').MongoClient
const app = express()

app.set('view engine', 'pug')
app.set('views', '.')

app.locals.pretty = true
//for html source code

app.use(bodyParse.urlencoded({extended: true}))

app.get('/', (rq, rs) =>
  rs.render('site', { mesajAl : rq.query.mesaj })
)

app.get('/deneme', (rq, rs) =>
  rs.sendFile(__dirname + '/index_benim.html')
)

app.get('/resim', (rq, rs) =>
  rs.render('resim')
)

app.post('/resim-al', atici.single('dosya'), function (rq, rs) {
    url = rq.body.url
    if (url){
     request.get(url).pipe(
       filesys.createWriteStream(md5(url))
     )
    }
    rs.redirect('/');
  }
);

app.post('/gonder', (rq, rs) =>
  mongo.connect('mongodb://localhost:27017/perde', function(err, database) {
    console.log('servera bagladi')
    var db = database.db('perde')
    db.collection('mesajlar').insertOne(rq.body)
    console.log('eklendi')
    rs.redirect('/?mesaj=true')
  })
)

app.use(express.static(__dirname + '/resources'))

app.listen(80)
