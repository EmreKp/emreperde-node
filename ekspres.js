const express = require('express')
const https = require('https')
const bodyParse = require('body-parser')
const multer = require('multer')
const request = require('request')
const fs = require('fs')
const geoip = require('geoip-lite-country')
const atici = multer({ dest: 'resources/imaj/'})
const mongo = require('mongodb').MongoClient
//const passp = require('passport')
//const passpStr = require('passport-local').Strategy
const config = require('./ozel.json')
const app = express()

app.set('view engine', 'pug')
app.set('views', '.')

app.locals.pretty = true
//for html source code

app.use(bodyParse.urlencoded({extended: true}))

app.get('/', function (rq, rs) {
    mongo.connect('mongodb://localhost:27017/perde', function(err, database) {
      var db = database.db('perde')
      var ip = rq.ip.replace('::ffff:', '')
      //TODO uygun olsun
      db.collection('ziyaretci').insertOne({'ip': ip})
      var geo = geoip.lookup(ip)
      console.log(rq.ip + " " + geo.country)
      db.collection('imajlar').find({}).toArray(function(err, resim){
        rs.render('site', {
          mesajAl : rq.query.mesaj,
          mapsKey : config.mapsApiKey,
          imgs: resim
        })
      })
    })
  }
)

app.get('/deneme', (rq, rs) =>
  rs.sendFile(__dirname + '/index_benim.html')
)

app.get('/resim', function(rq, rs){
  //passport.authenticate('local', function (rq, rs) {
    mongo.connect('mongodb://localhost:27017/perde', function(err, database) {
      var db = database.db('perde')
      db.collection('imajlar').find({}).toArray(function(err, imik){
        rs.render('resim', { imgs: imik })
      })
    })
  //})
})

app.get('/mesajlar', (rq, rs) =>
  mongo.connect('mongodb://localhost:27017/perde', function(err, database) {
    var db = database.db('perde')
    db.collection('mesajlar').find({}).toArray(function(err, mesaz){
      rs.render('mesaj', { messgs: mesaz })
    })
  })
)

app.post('/resim-al', atici.single('dosya'), function (rq, rs) {
    dosyaAdi = ''
    url = rq.body.url
    msc = new Date().getTime()
    console.log(msc)
    if (url){
      dosyaAdi = msc
      console.log("dosya adı")
      request.get(url).pipe(
        fs.createWriteStream(process.env.HOME + '/resources/imaj/' + msc)
     )
    }

    mongo.connect('mongodb://localhost:27017/perde', function(err, database) {
      var db = database.db('perde')
      db.collection('imajlar').insertOne({'resim': dosyaAdi.toString()})
      console.log(dosyaAdi)
    })

    rs.redirect('/');
  }
)

app.post('/resim-sil', (rq, rs) =>
  mongo.connect('mongodb://localhost:27017/perde', function(err, database) {
    var db = database.db('perde')
    db.collection('imajlar').remove(rq.body)
    //şimdilik sadece dbden silmek daha iyi
    rs.redirect('/#urunler')
  })
)

app.post('/gonder', (rq, rs) =>
  mongo.connect('mongodb://localhost:27017/perde', function(err, database) {
    var db = database.db('perde')
    rq.body.date = new Date()
    db.collection('mesajlar').insertOne(rq.body)
    console.log(rq.body)
    rs.redirect('/?mesaj=true')
  })
)

app.use('/', express.static(__dirname + '/resources'))
app.use('/.well-known', express.static(__dirname + '/.well-known', {
  setHeaders: (res) => {
    res.set('Content-Type', 'text/plain')
  }
}))

/*last is certificate
var opts = {
  key: fs.readFileSync('private.pem'),
  cert: fs.readFileSync('certificate.crt')
}

https.createServer(opts, app).listen(80)*/

app.listen(80)
