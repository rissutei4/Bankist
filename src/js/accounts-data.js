// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,
  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2020-07-12T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT',
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2024-07-19T18:49:59.371Z',
    '2024-07-22T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

// const accounts = [account1, account2];
let accounts = JSON.parse(localStorage.getItem('accounts')) || [account1, account2];
let account;
function createAccount(firstName, lastName) {
  const owner = `${firstName} ${lastName}`;
  const pin = Math.floor(1000 + Math.random() * 9000); // Generate 4-digit random pin
  const newAccount = {
    owner,
    movements: [],
    interestRate: 1.5,
    pin,
    movementsDates: [],
    currency: 'USD',
    locale: 'en-US',
    username: generateUsername(firstName, lastName, accounts), // Generate unique username
  };

  // Add the account to the accounts array and store it locally
  accounts.push(newAccount);
  account = newAccount;
  localStorage.setItem('accounts', JSON.stringify(accounts));
  return account;
}

// Function to generate a unique username for a single account
function generateUsername(firstName, lastName, existingAccounts) {
  let username = `${firstName[0].toLowerCase()}${lastName[0].toLowerCase()}`;
  while (existingAccounts.some(acc => acc.username === username)) {
    const randomFirst = firstName[Math.floor(Math.random() * firstName.length)].toLowerCase();
    const randomLast = lastName[Math.floor(Math.random() * lastName.length)].toLowerCase();
    username = `${firstName[0].toLowerCase()}${randomFirst}${lastName[0].toLowerCase()}${randomLast}`;
  }

  return username;
}
// Function to assign usernames to all accounts in bulk
const generateUsernames = function(accounts) {
  accounts.forEach(acc => {
    if (!acc.username) {
      const [firstName, lastName] = acc.owner.split(' ');
      acc.username = generateUsername(firstName, lastName, accounts);
    }
  });
};

// Usage example:
generateUsernames(accounts);

// Export items
export {account1, account2, account, accounts, createAccount, generateUsername, generateUsernames};
