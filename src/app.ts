/** 3-PARTY MODULES */
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const xss = require('xss-clean');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const hbs = require('hbs');
let helpers = require('handlebars-helpers')();
const bodyParser = require('body-parser');
const compression = require('compression');

/** INBUILT MODULES */
const path = require('path');
const http = require("http");  

/** PERSONAL MODULES */
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

const app = express();

const Oglas = require('./models/oglasModel');
const catchAsync = require('./utils/catchAsync');

//Defining paths for public directories, and views 
const publicDirectoryPath = path.join(__dirname, './public');
const viewsPath = path.join(__dirname, './views');
const partialsPath = path.join(__dirname, './views/partials');
 
/** HANDLEBARS TL SETTINGS */ 
app.set('view engine', 'hbs');
app.set('views', viewsPath);
hbs.registerPartials(partialsPath);
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
/** END - HANDLEBARS TL SETTINGS */ 

/** STRIPE WEBHOOK */ 
app.post(
  '/webhook-naplata',
  bodyParser.raw({ inflate: true, type: '*/*' }),
  rezervacijaController.webhookNaplata
);
/** END - STRIPE WEBHOOK */ 

/////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////

/** GENERAL MIDDLEWARES */
// Midd. for serving static files
app.use(express.static(publicDirectoryPath));

// Midd. for setting up secure http headers
app.use(helmet());

// Midd. for CORS 
app.use(cors());

// Midd. for event loggin
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Midd. for rate limiting, from the same IP address
const limiter = rateLimit({
  max: 200,
  windowMs: 60 * 60 * 1000,
  message: 'Request limit reached, try again later!'
});
app.use('/', limiter);

// Midd. for limitting the packed size to 10KB
app.use(express.json({ limit: '10kb' }));

// Midd. for conversion the data from body, to req.body
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Midd. for data sanitisation, against NoSQL injection
app.use(mongoSanitize());

// Midd. for sanitisation against CRoS SITE SCRIPTIONG
app.use(xss());

// Midd. for disabling paramtere polution
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

// Midd. for JSON and HTML compression
app.use(compression());

//Midd. for auth check
app.use(authentifikacijskiController.provjeraPrijavljenosti);
/** END - GENERAL MIDDLEWARES */

/////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////

/** ROUTES */    
app.use('/podatci/korisnici', korisnikAPIRouter);
app.use('/korisnici', korisnikRouter);
app.use('/ponude', ponudaRouter);
app.use('/oglasi', oglasRouter);
app.use('/recenzije', recenzijaRouter);
app.use('/rezervacije', rezervacijaRouter);
app.use('/statistika', statistikaRouter);
app.use('/', generalniRouter);


// Download routes
app.get(
  '/preuzimanjeSpecificneDatoteke/:fileName/:oglasId',
  authentifikacijskiController.provjeraPrijavljenosti,
  authentifikacijskiController.zastita,
  catchAsync(async(req,res,next)=>{
    const oglas = await Oglas.findById(req.params.oglasId);
     if(oglas.zaposlenik.includes(req.user.id) || req.status=="admin"){
      let a = publicDirectoryPath + "/dokumenti/oglasi/" + req.params.fileName; 
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
     let a = publicDirectoryPath + "/dokumenti/oglasi/" + req.params.fileName; 
    res.download(a); 
   }
); 
app.get(
  '/preuzimanjeJavneDatoteke/:fileName',
  (req,res)=>{
    let a = publicDirectoryPath + "/dokumenti/oglasi/" + req.params.fileName; 
    res.download(a); 
   }
);
/** END - ROUTES */    

// Middleware za rukovanje nastalim greškama
app.use(globalErrorHandler);


module.exports = {
  app
};
