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
  rs.render('site', {
    mesajAl : rq.query.mesaj,
    mapsKey : 'AIzaSyDz9HOAsysQ4b3GHOyuIBxajKvdZUndT80'
  })
)

app.get('/deneme', (rq, rs) =>
  rs.sendFile(__dirname + '/index_benim.html')
)

app.get('/resim', (rq, rs) =>
  rs.render('resim')
)

app.get('/mesajlar', (rq, rs) =>
  mongo.connect('mongodb://localhost:27017/perde', function(err, database) {
    var db = database.db('perde')
    db.collection('mesajlar').find({}).toArray(function(err, mesaz){
      console.log(mesaz)
      rs.render('mesaj', { messgs: mesaz })
    })
  })
)

app.get("/mapsal", (rq, rs) =>
  rs.render('mapsdemo', { mapsKey: 'AIzaSyDz9HOAsysQ4b3GHOyuIBxajKvdZUndT80'})
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
    var db = database.db('perde')
    rq.body.date = new Date()
    db.collection('mesajlar').insertOne(rq.body)
    console.log(rq.body)
    rs.redirect('/?mesaj=true')
  })
)

app.use(express.static(__dirname + '/resources'))

app.listen(80)
