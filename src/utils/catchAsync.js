// Funkcija koja kao argument prima funkciju, te u slucaju Erora predaje objekat "next" u catch funciju.

module.exports = fn => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
