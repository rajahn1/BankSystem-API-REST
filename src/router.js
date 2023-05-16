const express = require('express');
const router = express();
const middleware = require('./middleware');
const { listAccounts, createAccount, updateUserAccount, deleteAccount, deposit, withdraw, transfer, balance, statement } = require('./controls/bank');

router.use(express.json());
router.use(middleware.authentication);

router.get('/accounts', listAccounts);
router.post('/accounts', createAccount);
router.put('/accounts/:numberAccount/user', updateUserAccount);
router.delete('/accounts/:numberAccount', deleteAccount);
router.post('/transactions/deposit', deposit);
router.post('/transactions/withdraw', withdraw);
router.post('/transactions/transfer', transfer);
router.get('/accounts/balance', balance);
router.get('/accounts/extract', statement);

module.exports = router;