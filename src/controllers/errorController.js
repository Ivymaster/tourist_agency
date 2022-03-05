const AppError = require("./../utils/appError");

// Definiranje OPERACIONIH gresaka
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  console.log(value);

  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError("Invalid token. Please log in again!", 401);

const handleJWTExpiredError = () =>
  new AppError("Your token has expired! Please log in again.", 401);

//Fja za hendlovanje erora u procesu razvoja aplikacije (developmentu)
const sendErrorDev = (err, req, res) => {
  // za API, u slucaju nastanka erora na urlovima rezervisanih za "JSON" odgovore
  if (req.originalUrl.startsWith("/api")) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }

  // za greske nastale na urlovima rezervisnim za web stranicu
  console.error("ERROR", err);
  return res.status(err.statusCode).render("error", {
    title: "Upsss, nesto se pokvarilo!",
    msg: err.message || "Greska na serveru",
  });
};

const sendErrorProd = (err, req, res) => {
  // Za JSON tip odgovora
  if (req.originalUrl.startsWith("/api")) {
    // Za operacione greske, greske koje se mogu predvidjeti, tipa netocna putanja, nemoguca konekcija sa bazom, pustaju se korisniku
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    // Programske greske, ne pustaju se korisniku. Zapisuju se "zapisniku", tj. u konzoli
    console.error("ERROR", err);
    // Generican odgovor, za nepoznate greske, i greske koje se ne smiju prikazati korisniku
    return res.status(500).json({
      status: "error",
      message: "Something went very wrong!",
    });
  }

  // Isti proces, ali za urlove u vezi sa web stranicama
  if (err.isOperational) {
    console.log(err);
    return res.status(err.statusCode).render("error", {
      title: "Something went wrong!",
      msg: err.message,
    });
  }
  // Programske greske
  console.error("ERROR", err);
  return res.status(err.statusCode).render("error", {
    title: "Something went wrong!",
    msg: "Please try again later.",
  });
};

// Middleware za rukovanje sa nastalim greskama, pozivan na kraju svih middlewarea, ako nema generisanih informacija o istoj, predaje se kod 500
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };
    error.message = err.message;
    console.log("asddddddddddddddddddd" + error);
    if (error.name === "CastError") error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === "ValidationError")
      error = handleValidationErrorDB(error);
    if (error.name === "JsonWebTokenError") error = handleJWTError();
    if (error.name === "TokenExpiredError") error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};
