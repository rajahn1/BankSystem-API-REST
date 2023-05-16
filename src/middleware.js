const data = require('./data');

const authentication = (req, res, next) => {
    const { bank_password } = req.query;
    const correctPassword = data.bank.password;

    if (!bank_password) return res.status(400).send({message: 'enter the bank_password to gain access.'});
    if (bank_password !== correctPassword) return res.status(400).send({message: 'wrong bank_password, try again!'});
    
    next();
};

module.exports = {
    authentication
};