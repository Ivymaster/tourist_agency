// Klasa koja extenda klasu Error, nadodaje na objekat atribut statusnog koda, statusa, kao i atribut isOperational.
// Tako se nazacava da je izazvani error tipa "operacioni error", tj predvidjen je od strane nas
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
