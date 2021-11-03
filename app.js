//3-party moduli
const express = require('express');
const path = require('path');
const http = require("http"); //uvpđenje modula za kreiranje http servera

const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const xss = require('xss-clean');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const compression = require('compression');
const hbs = require('hbs');
const socketio = require("socket.io"); // uvođenje modula za kreiranje webSocket veze
var helpers = require('handlebars-helpers')();

const app = express();
 //Developer moduli
 const AppError = require('./utils/appError');
 const chatUzivo = require('./utils/socket');
const globalErrorHandler = require('./controllers/errorController');
const korisnikAPIRouter = require('./routes/korisnikAPIRoutes');
const korisnikRouter = require('./routes/korisnikRoutes');
const ponudaRouter = require('./routes/ponudaRoutes');
const oglasRouter = require('./routes/oglasRoutes');
const generalniRouter = require('./routes/generalneRoutes');
const recenzijaRouter = require('./routes/recenzijaRoutes');
const rezervacijaRouter = require('./routes/rezervacijaRoutes');
const statistikaRouter = require('./routes/statistikaRoutes');
const rezervacijaController = require('./controllers/rezervacijaController');
const generalniController = require('./controllers/generalniController');
const authentifikacijskiController = require('./controllers/authentifikacijskiController');

const Oglas = require('./models/oglasModel');
const catchAsync = require('./utils/catchAsync');

//Kreiranje putanja za public folder, i "poglede"
const putanjaPublicDirektorija = path.join(__dirname, './public');
const viewsPutanja = path.join(__dirname, './views');
const partialsPutanja = path.join(__dirname, './views/partials');

UV_THREADPOOL_SIZE=8;
//postavke za HANDLEBARS
app.set('view engine', 'hbs');
app.set('views', viewsPutanja);
hbs.registerPartials(partialsPutanja);
hbs.registerHelper('ifEquals', function(arg1, arg2, options) {
  return arg1 == arg2 ? options.fn(this) : options.inverse(this);
});
hbs.registerHelper('ifNotEquals', function(arg1, arg2, options) {
  return arg1 != arg2 ? options.fn(this) : options.inverse(this);
});
hbs.registerHelper('ifNotDoubleEquals', function(arg1, arg2, arg3, options) {
  return arg1 != arg2 || arg1!=arg3 ? options.fn(this) : options.inverse(this);
});
hbs.registerHelper('ifDoubleEquals', function(arg1, arg2, arg3, options) {
  return arg1 == arg2 || arg1 == arg3
    ? options.fn(this)
    : options.inverse(this);
});
hbs.registerHelper('ifGreaterThan', function(arg1, arg2, options) {
  return arg1 > arg2 ? options.fn(this) : options.inverse(this);
});
hbs.registerHelper('ifRange', function(arg1, arg2, arg3, options) {
  return arg1 > arg2 && arg1<arg3 ? options.fn(this) : options.inverse(this);
});
hbs.registerHelper('ifDateGreaterThan', function(arg1, options) {
  return new Date(arg1) > new Date() ? options.fn(this) : options.inverse(this);
});
hbs.registerHelper('ifDateLessThan', function(arg1, options) {
  return new Date(arg1) <= new Date() ? options.fn(this) : options.inverse(this);
});
hbs.registerHelper('subString', function(predanaRijec, pocetak, kraj) {
  if(!predanaRijec) return false; 
   var krajnjaRijec = predanaRijec.toString().substring(pocetak, kraj);
  return new hbs.SafeString(krajnjaRijec)
});

hbs.registerHelper('specificElement', function(niz, pozicijaElementa) {
  var element = niz[pozicijaElementa];
 return new hbs.SafeString(element)
});
 
hbs.registerHelper('prikazSlobodnihMjesta', function(datumi, slobodni) {
  for(let el in datumi){
    if(new Date(datumi[el])>=new Date()){
      return new hbs.SafeString(slobodni[el]);
    }
  }
  return new hbs.SafeString(slobodni[0]);
});

hbs.registerHelper('datumPonudeNaRezervaciji', function(datumPocetka, datumi) {
  for(let el in datumi){
    if(new Date(datumi[el])>=new Date(datumPocetka)){
      return new hbs.SafeString(datumi[el]);
    }
  }
  return new hbs.SafeString(datumi[0]);
}); 

hbs.registerHelper('datumPonudeNaPrikazuPonuda', function(datumi) {
  for(let el in datumi){
    if(new Date(datumi[el])>=new Date()){
      return new hbs.SafeString(datumi[el]);
    }
  }
  return new hbs.SafeString(datumi[datumi.length-1]);
}); 
// Stripe webhook, isti se postavlja prije parsiranja dolaznih podataka, jer zahtjeva raw formu
app.post(
  '/webhook-naplata',
  bodyParser.raw({ inflate: true, type: '*/*' }),
  rezervacijaController.webhookNaplata
);




// Middleware za posluzivanje staticnih datoteka
app.use(express.static(putanjaPublicDirektorija));

// Middleware za postavljanje sigurnosnih HTTP zaglavlja (headera)
app.use(helmet());

// Middleware za omogućavanje CORS-a
app.use(cors());

// Middleware za logiranje događaja tokom razvoja
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Middleware za ograničavanje broja zahtjeva sa određene IP adrese
const limiter = rateLimit({
  max: 200,
  windowMs: 60 * 60 * 1000,
  message: 'Previse zahtjeva, pokušajte kasnije!'
});
app.use('/', limiter);

// Middleware za konverziju podataka iz body u req.body
// Onemogućavanje paketa većih od 10 kB
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());


// Download route, za skidanje dokumenata, poput onih za oglase
app.get(
  '/preuzimanjeSpecificneDatoteke/:fileName/:oglasId',
  authentifikacijskiController.provjeraPrijavljenosti,
  authentifikacijskiController.zastita,
  catchAsync(async(req,res,next)=>{
    const oglas = await Oglas.findById(req.params.oglasId);
     if(oglas.zaposlenik.includes(req.user.id) || req.status=="admin"){
      let a = putanjaPublicDirektorija + "/dokumenti/oglasi/" + req.params.fileName; 
      res.download(a); 
    }else{
      return next(new AppError("Zastićeni podatci, ne pokušavajte pristupiti"));
    }
     
   })
);
app.get(
  '/preuzimanjeAgencijskeDatoteke/:fileName',
  authentifikacijskiController.zastita,
  (req,res,next)=>{
    if(req.user.uloga!="zaposlenik" &&  req.user.uloga!="admin"){
     return next(new AppError("Zastićeni podatci, ne pokušavajte pristupiti"));
    }
     let a = putanjaPublicDirektorija + "/dokumenti/oglasi/" + req.params.fileName; 
    res.download(a); 
   }
);

app.get(
  '/preuzimanjeJavneDatoteke/:fileName',
  (req,res)=>{
    let a = putanjaPublicDirektorija + "/dokumenti/oglasi/" + req.params.fileName; 
    res.download(a); 
   }
);


// Middleware za sanitizaciju podataka protiv NoSQL query ubacivanja
app.use(mongoSanitize());

// Middleware za sanitizaciju podataka protiv XSS - "Cross site scripting"
// Maliciozni HTML kod
app.use(xss());

// Middleware za specavanje polucije parametara
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

// Middleware za kompresiju JSON i HTML odgovora
app.use(compression());
 

//Middleware za provjeru prijavljanosti korisnika, pri svakom zahtjevu
app.use(authentifikacijskiController.provjeraPrijavljenosti);

///////////////////////////////////////
/////// RUTE /////////////////////////
// Live chat - admin
 
   
app.use('/podatci/korisnici', korisnikAPIRouter);
app.use('/korisnici', korisnikRouter);
app.use('/ponude', ponudaRouter);
app.use('/oglasi', oglasRouter);
app.use('/recenzije', recenzijaRouter);
app.use('/rezervacije', rezervacijaRouter);
app.use('/statistika', statistikaRouter);
app.use('/', generalniRouter);


// Rukovatelj za nedeklarirane rute
//app.all('*', (req, res, next) => {
 // next(new AppError(`Nemoguce pronaci ${req.originalUrl} putanju!`, 404));
//});

// Middleware za rukovanje nastalim greškama
app.use(globalErrorHandler);

var time = process.hrtime();
process.nextTick(function() {
   var diff = process.hrtime(time);


   console.log('benchmark took %d nanoseconds', diff[0] * 1e9 + diff[1]);
   // benchmark took 1000000527 nanoseconds
});

module.exports = {
  app,
};
