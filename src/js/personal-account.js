'use strict';
/////////////////////////////////////////////////
import {accounts} from './accounts-data.js';

// console.log(accounts);
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions
const internalizedMoney = function (value, locale, currency) {
    return Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
    }).format(value);
}
const displayMovements = function (account, sort = false) {
    containerMovements.innerHTML = '';

    const movs = sort ? account.movements.slice().sort((a, b) => a - b) : account.movements;

    const formatMovementDate = function (date, locale) {
        const daysPassed = (date1, date2) => Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));
        const calculatedDays = daysPassed(new Date(), date);
        // console.log(calculatedDays)
        if (calculatedDays === 0) return 'Today';
        if (calculatedDays === 1) return 'Yesterday';
        if (calculatedDays <= 7) return `${calculatedDays} days ago`;
        return new Intl.DateTimeFormat(locale).format(date)


    }
    movs.forEach(function (mov, i) {
        const type = mov > 0 ? 'deposit' : 'withdrawal';
        const date = new Date(account.movementsDates[i])
        const displayDate = formatMovementDate(date, account.locale);


        const formattedMov = new Intl.NumberFormat(account.locale, {
            style: 'currency',
            currency: account.currency
        }).format(mov);

        const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
            i + 1
        } ${type}</div>
        <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formattedMov}</div>
      </div>
    `;

        containerMovements.insertAdjacentHTML('afterbegin', html);
    });
};

const calcDisplayBalance = function (acc) {
    acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);

    labelBalance.textContent = `${internalizedMoney(acc.balance, acc.locale, acc.currency)}`;
};

const calcDisplaySummary = function (acc) {
    const incomes = acc.movements
        .filter(mov => mov > 0)
        .reduce((acc, mov) => acc + mov, 0);
    labelSumIn.textContent = `${internalizedMoney(incomes, acc.locale, acc.currency)}`;

    const out = acc.movements
        .filter(mov => mov < 0)
        .reduce((acc, mov) => acc + mov, 0);
    labelSumOut.textContent = `${internalizedMoney(Math.abs(out), acc.locale, acc.currency)}`;

    const interest = acc.movements
        .filter(mov => mov > 0)
        .map(deposit => (deposit * acc.interestRate) / 100)
        .filter((int, i, arr) => {
            // console.log(arr);
            return int >= 1;
        })
        .reduce((acc, int) => acc + int, 0);
    labelSumInterest.textContent = `${internalizedMoney(interest, acc.locale, acc.currency)}`;
};

const updateUI = function (acc) {
    // Display movements
    displayMovements(acc);

    // Display balance
    calcDisplayBalance(acc);

    // Display summary
    calcDisplaySummary(acc);
};
//Start log out timer
const startLogOutTimer = function () {
    //Set time to 10 minutes
    let time = 600;

    const tick = function () {
        const min = String(Math.trunc(time / 60)).padStart(2, 0);
        const sec = String(time % 60).padStart(2, 0);
        //In each call, print the remaining time to UI
        labelTimer.textContent = `${min}:${sec}`;
        if (time === 0) {
            clearInterval(timer);
            labelWelcome.textContent = 'Log in to get started';
            containerApp.style.opacity = 0;
        }
        time = time - 1;
    }

    //Call the timer every second
    tick()
    const timer = setInterval(tick, 1000);
    return timer
};
///////////////////////////////////////
// Event handlers
let currentAccount, timer;
//Fake always logged in
// currentAccount = account1;
// updateUI(currentAccount)
// containerApp.style.opacity = 0;


btnLogin.addEventListener('click', function (e) {
    // Prevent form from submitting
    e.preventDefault();

    currentAccount = accounts.find(
        acc => acc.username === inputLoginUsername.value
    );
    // console.log(currentAccount);

    if (currentAccount?.pin === +(inputLoginPin.value)) {
        // Display UI and message
        labelWelcome.textContent = `Welcome back, ${
            currentAccount.owner.split(' ')[0]
        }`;
        containerApp.style.opacity = 100;
        const now = new Date();
        const options = {
            hour: 'numeric',
            minute: 'numeric',
            day: 'numeric',
            month: 'numeric',
            year: 'numeric'
        }
        labelDate.textContent = new Intl.DateTimeFormat(currentAccount.locale, options).format(now);
        // Clear input fields
        inputLoginUsername.value = inputLoginPin.value = '';
        inputLoginPin.blur();
        if(timer) clearInterval(timer);
        timer = startLogOutTimer();
        // Update UI
        updateUI(currentAccount);
    } else{
        alert(`Dear user, you have tried to input the wrong login information. Try again!`)
    }
});

btnTransfer.addEventListener('click', function (e) {
    e.preventDefault();
    const amount = +(inputTransferAmount.value);
    const receiverAcc = accounts.find(
        acc => acc.username === inputTransferTo.value
    );
    inputTransferAmount.value = inputTransferTo.value = '';

    if (
        amount > 0 &&
        receiverAcc &&
        currentAccount.balance >= amount &&
        receiverAcc?.username !== currentAccount.username
    ) {
        // Doing the transfer
        currentAccount.movements.push(-amount);
        receiverAcc.movements.push(amount);

        //Add date of the transaction
        currentAccount.movementsDates.push(new Date().toISOString());
        receiverAcc.movementsDates.push(new Date().toISOString());
        // Update UI
        updateUI(currentAccount);
        localStorage.setItem('accounts', JSON.stringify(accounts));
        //reset timer
        clearInterval(timer);
        timer = startLogOutTimer();
    }
});

btnLoan.addEventListener('click', function (e) {
    e.preventDefault();

    const amount = Math.floor(inputLoanAmount.value);

    if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
        setTimeout(function () {
            // Add movement
            currentAccount.movements.push(amount);

            //Add date of the transaction
            currentAccount.movementsDates.push(new Date().toISOString());

            // Update UI
            updateUI(currentAccount);
            clearInterval(timer);
            timer = startLogOutTimer();
        }, 3000)
    }
    inputLoanAmount.value = '';

});

btnClose.addEventListener('click', function (e) {
    e.preventDefault();

    if (
        inputCloseUsername.value === currentAccount.username &&
        Number(inputClosePin.value) === currentAccount.pin
    ) {
        const index = accounts.findIndex(
            acc => acc.username === currentAccount.username
        );
        // console.log(index);
        // .indexOf(23)

        // Delete account
        accounts.splice(index, 1);

        // Hide UI
        containerApp.style.opacity = 0;
    }

    inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
    e.preventDefault();
    displayMovements(currentAccount, !sorted);
    sorted = !sorted;
});

/////////////////////////////////////////////////