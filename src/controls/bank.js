const fs = require('fs/promises');
const data = require('../data');
const accounts = data.accounts;
const deposits = data.deposits;
const transfers = data.transfers;
const statements = data.transfers;
const withdrawals = data.withdrawals;

let idNewAccount = 1;

const currentDate = () => {
    const actualDate = new Date();
    const day = actualDate.getDate();
    const month = (actualDate.getMonth() + 1);
    const year = actualDate.getFullYear();
    const hours = actualDate.getHours();
    const minutes = actualDate.getMinutes();
    const seconds = actualDate.getSeconds();

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

function accountFind (numberAccount) {
    const accountTrue = accounts.find((account) => {
        return account.number === Number(numberAccount);
    })

    return accountTrue;
};

function verifyCpf (cpf) {
    const cpfTrue = accounts.find((item) => {
        return item.user.cpf === cpf;
    });

    return cpfTrue;
};

function verifyEmail (email){ 
    const emailTrue = accounts.find((item) => {
    return item.user.email === email;
    });

    return emailTrue;
};

function writeData (accounts, withdrawals, deposits, transfers) {
    return `module.exports = {
        bank: {
            name: 'Cubos Bank',
            number: '123',
            agency: '0001',
            password: 'Cubos123Bank'
        },
        accounts: ${accounts != "" ? JSON.stringify(accounts) : "[]"},
        withdrawals: ${withdrawals != "" ? JSON.stringify(withdrawals) : "[]"},
        deposits: ${deposits != "" ? JSON.stringify(deposits) : "[]"},
        transfers: ${transfers != "" ? JSON.stringify(transfers) : "[]"}
      };`
}

const listAccounts = (req, res) => {
    return res.status(200).json(accounts);
};

const createAccount = async (req, res) => {
    const {name, cpf, birthday, phone, email, password} = req.body;

    if (verifyEmail(email)) return res.status(400).json({message: 'there is already an account with this email.'});
    if (verifyCpf(cpf)) return res.status(400).json({message: 'there is already an account with this CPF.'});

    if (!name) return res.status(400).json({mensagem: 'provide the name in the request body.'});
    if (!cpf)return res.status(400).json({mensagem: 'provide the CPF in the request body.'});
    if (!birthday) return res.status(400).json({mensagem: 'provide the birthday in the request body.'});
    if (!phone) return res.status(400).json({mensagem: 'provid the phone in the request body.'});
    if (!email) return res.status(400).json({mensagem: 'provide the email in the request body.'});
    if (!password) return res.status(400).json({mensagem: 'provide the password in the request body.'});

    const newAccount = {
        number:  idNewAccount,
        balance: 0,
        user: {
            name,
            cpf,
            birthday,
            phone,
            email,
            password
        }
    };

    accounts.push(newAccount);

    await fs.writeFile('./src/data.js', writeData(accounts, withdrawals, deposits, transfers));
    
    idNewAccount++;

    return res.status(201).send();
};

const updateUserAccount = async (req, res) => {
    const { numberAccount } = req.params;
    const {name, cpf, birthday, phone, email, password} = req.body;
    const findAccount = accountFind(numberAccount);

    if (!name && !cpf && !birthday && !phone && !email && !password) 
    return res.status(400).json({message: 'provide at least one property in the request body.'});

    if (!findAccount) return res.status(404).json({message: 'account not found.'});

    if (verifyEmail(email)) return res.status(400).json({message: 'there is already an account with this email.'});
    if (verifyCpf(cpf)) return res.status(400).json({message: 'there is already an account with this cpf.'});

    if (name) findAccount.user.name = name;
    if (cpf) findAccount.user.cpf = cpf;
    if (birthday) findAccount.user.birthday = birthday;
    if (phone) findAccount.user.phone = phone;
    if (email) findAccount.user.email = email;
    if (password) findAccount.user.password = password;

    await fs.writeFile('./src/data.js', writeData(accounts, withdrawals, deposits, transfers));

    return res.status(200).json({message: 'account updated!'});
};

const deleteAccount = async (req, res) => {
    const { numberAccount } = req.params;
    const findAccount = accountFind(numberAccount);

    if (!findAccount) return res.status(404).json({message: 'account not found.'});
    if (findAccount.balance !== 0) return res.status(400).json({message: 'you cannot delete a account with balance.'});

    accounts.splice(accounts.indexOf(findAccount), 1);
    await fs.writeFile('./src/data.js', writeData(accounts, withdrawals, deposits, transfers));
    res.status(200).json({message: 'account deleted!'});
};

const deposit = async (req, res) => {
    const {number_account, value} = req.body;

    if (!number_account) return res.status(400).json({mensagem: 'provide the number_account in the request body.'});
    if (!value || value <= 0) return res.status(400).json({mensagem: 'provide a positive value to deposit.'});

    const findAccount = accountFind(number_account);

    if (!findAccount) return res.status(404).json({message: 'account not found.'});

    const newDeposit = {
        date: currentDate(),
        number_account,
        value
    };

    deposits.push(newDeposit);

    findAccount.balance += Number(value);

    await fs.writeFile('./src/data.js', writeData(accounts, withdrawals, deposits, transfers));

    return res.status(201).json(newDeposit);
};

const withdraw = async (req, res) => {
    const { number_account, value, password } = req.body;

    if(!number_account || !value || !password) 
    return res.status(400).json({message: 'provide the number_account, value and password in the request body.'});

    const findAccount = accountFind(number_account);

    if (!findAccount) return res.status(404).json({message: 'account not found.'});
    if (password !== findAccount.user.password) return res.status(400).json({message:'wrong password.'});
    if (value > findAccount.balance) return res.status(400).json({message: 'insufficient funds!'});

    findAccount.balance -= value;

    const withdrawRecord = {
        date: currentDate(),
        number_account,
        value
    };

    data.withdrawals.push(withdrawRecord);

    await fs.writeFile('./src/data.js', writeData(accounts, withdrawals, deposits, transfers));

    return res.status(201).json(withdrawRecord);
};

const transfer = async (req, res) => {
    const {number_account_origin, number_account_destiny, password_account_origin, value} = req.body;

    if (!number_account_origin) return res.status(400).json({mensagem: 'provide the number_account_origin in the request body.'});
    if (!number_account_destiny)return res.status(400).json({mensagem: 'provide the number_account_destiny in the request body.'});
    if (!password_account_origin) return res.status(400).json({mensagem: 'provide the password_account_origin in the request body.'});
    if (!value) return res.status(400).json({mensagem: 'provide the transfer value.'});

    const findAccountOrigin = accountFind(number_account_origin);
    if (!findAccountOrigin) return res.status(404).json({message: 'origin account not found.'});

    const findAccountDestination = accountFind(number_account_destiny);
    if (!findAccountDestination) return res.status(404).json({message: 'destiny account not found.'});

    const correctPassword = toString(findAccountOrigin.user.password);
    if (correctPassword !== toString(password_account_origin)) return res.status(400).json({message: 'wrong password.'});

    const balance = findAccountOrigin.balance;
    if (balance < value) return res.status(400).json({message: 'insufficiente funds to transfer.'});

    const newTransfer = {
        date: currentDate(),
        number_account_origin,
        number_account_destiny,
        value
    };

    transfers.push(newTransfer);

    findAccountOrigin.balance -= Number(value);
    findAccountDestination.balance += Number(value);

    await fs.writeFile('./src/data.js', writeData(accounts, withdrawals, deposits, transfers));

    return res.status(201).json({message: 'transfer done with success!'});
};

const balance = (req, res) => {
    const { number_account, password } = req.query;

    if (!number_account || !password) return res.status(400).json({message: 'provide the number_account and password in the request query.'});

    const findAccount = accountFind(number_account);
    if (!findAccount) return res.status(404).json({message: 'account not found.'});

    const correctPassword = findAccount.user.password;    
    if (correctPassword !== password) return res.status(400).json({message: 'wrong password.'});

    res.status(200).json(findAccount.balance);
};

const statement = (req, res) => {
    const { password, number_account } = req.query;

    if (!password) return res.status(400).json({mensagem: 'provide the password in the request query.'});
    if (!number_account)return res.status(400).json({mensagem: 'provide the number_account in the request query.'});

    const findAccount = accountFind(number_account);
    if (!findAccount) return res.status(404).json({message: 'account not found.'});

    const findDeposits = deposits.filter ( deposit => {return deposit.number_account == Number(number_account)});
    const findWithdrawlsAccount = withdrawals.filter ( deposit => {return deposit.number_account == Number(number_account)});
    const findTransfersSend = transfers.filter (transfer => {return transfer.number_account_origin == Number(number_account)});
    const findTransfersReceived = transfers.filter (transfer => {return transfer.number_account_destiny == Number(number_account)});

    const getStatement = {
        deposits: findDeposits,
        withdrawals: findWithdrawlsAccount,
        sentTransfers: findTransfersSend,
        receivedTransfers: findTransfersReceived
    };

    statements.push(getStatement);
    
    return res.status(201).json(getStatement);
};

module.exports = {
    listAccounts,
    createAccount,
    updateUserAccount,
    deleteAccount,
    deposit,
    withdraw,
    transfer,
    balance,
    statement
};
