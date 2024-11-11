'use strict';
import {account, accounts, createAccount, generateUsernames } from './accounts-data.js';
generateUsernames(accounts);
console.log(accounts);
///////////////////////////////////////
// Modal window
const btnScrollTo = document.querySelector('.btn--scroll-to');
const section1 = document.querySelector('#section--1');
const modal = document.querySelector('.modal');
const overlay = document.querySelector('.overlay');
const btnCloseModal = document.querySelector('.btn--close-modal');
const btnsOpenModal = document.querySelectorAll('.btn--show-modal');
const containerForm = document.querySelector('.container-form');
const nav = document.querySelector('.nav');
const tabs = document.querySelectorAll('.operations__tab');
const tabsContainer = document.querySelector('.operations__tab-container');
const tabsContent = document.querySelectorAll('.operations__content');
//Modal window and forms
let formData = { firstName: '', lastName: '' };
const renderForm = function() {
  containerForm.insertAdjacentHTML('beforeend', `
    <h2 class="modal__header">
        Open your bank account <br/>
        in just <span class="highlight">5 minutes</span>
    </h2>
    <form class="modal__form">
        <label>First Name</label>
        <input type="text" id="first-name" value="${formData.firstName}" required/>
        <label>Last Name</label>
        <input type="text" id="last-name" value="${formData.lastName}" required/>
        <button class="btn" type="submit">Next step &rarr;</button>
        <p class="extra-option">Already have an account?
            <a href="account.html" target="_blank">Log in&rarr;</a>
        </p>
    </form>`);
  const form = document.querySelector('.modal__form');
  form.addEventListener('submit', formSubmitHandler);
};

const formSubmitHandler = function(e) {
  e.preventDefault();
  e.stopPropagation();
  formData.firstName = document.querySelector('#first-name').value;
  formData.lastName = document.querySelector('#last-name').value;
  console.log(formData);
  if (!validateFields()) {
    errorMessage();
    return;
  }
  const newAccount = createAccount(formData.firstName, formData.lastName);
  successMessage(newAccount);
  console.log(accounts)
};
const validateFields = function() {
  const firstNameField = document.querySelector('#first-name').value;
  const lastNameField = document.querySelector('#last-name').value;
  const letterOnlyRegex = /^[A-Za-z\s]+$/;
  return firstNameField.trim() !== '' &&
    lastNameField.trim() !== '' &&
    letterOnlyRegex.test(firstNameField) &&
    letterOnlyRegex.test(lastNameField);
};
const errorMessage = function() {
  containerForm.innerHTML = ` `;
  modal.classList.add('error');
  containerForm.insertAdjacentHTML('beforeend',
    `
    <h2 class="modal__header error">
        Error!
    </h2>
    <p class="message">
        Please, input the correct data.
    </p>
    `);
};
const successMessage = function() {
  containerForm.innerHTML = ` `;
  modal.classList.add('success');
  containerForm.insertAdjacentHTML('beforeend',
    `
    <h2 class="modal__header success">
        Success!
    </h2>
    <p class="message">
        You have successfully registered!
        <span style="display: block">Your login is: ${account.username}</span>
        <span style="display: block">Your pin is:${account.pin}</span>
    </p>
    <a class='btn success' href="account.html">Log in&rarr;</a>
    `);
};
const openModal = function(e) {
  e.preventDefault();
  modal.classList.remove('hidden');
  overlay.classList.remove('hidden');
  renderForm();
};

const closeModal = function() {
  if (modal.classList.contains('error')) {
    modal.classList.remove('error');
    containerForm.innerHTML = ` `;
    renderForm();
  } else {
    modal.classList.add('hidden');
    overlay.classList.add('hidden');
    containerForm.innerHTML = ` `;
    formData = { firstName: '', lastName: '' };
  }
};

btnsOpenModal.forEach(btn => btn.addEventListener('click', openModal));

btnCloseModal.addEventListener('click', closeModal);
overlay.addEventListener('click', closeModal);

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
    closeModal();
  }
});
//Page navigation
btnScrollTo.addEventListener('click', function(e) {
  const s1coords = section1.getBoundingClientRect();
  section1.scrollIntoView({ behavior: 'smooth' });
});

//Event delegation - add event listener to common parent element
//Determine what element originated the event
document.querySelector('.nav__links').addEventListener('click', function(e) {
  e.preventDefault();

  //Matching strategy
  if (e.target.classList.contains('nav__link')) {
    const id = e.target.getAttribute('href');
    document.querySelector(id).scrollIntoView({ behavior: 'smooth' });
  }
});
//Tabbed component
tabsContainer.addEventListener('click', function(e) {
  const clicked = e.target.closest('.operations__tab');
  // console.log(clicked);
  if (!clicked) return;

  //Active Tab
  tabs.forEach(t => t.classList.remove('operations__tab--active'));
  tabsContent.forEach(c => c.classList.remove('operations__content--active'));

  clicked.classList.add('operations__tab--active');


  //Activate content area
  document.querySelector(`.operations__content--${clicked.dataset.tab}`).classList.add('operations__content--active');
});

//menu fade aniomation

const handlingHover = function(e, opacity) {
  if (e.target.classList.contains('nav__link')) {
    const link = e.target;
    const linksParent = link.closest('.nav').querySelectorAll('.nav__link');
    const logo = link.closest('.nav').querySelector('img');

    linksParent.forEach(el => {
      if (el !== link) el.style.opacity = this;
    });
    logo.style.opacity = this;
  }
};
//Passing an "argument" into handler. Event handler can only take one functionx
nav.addEventListener('mouseover', handlingHover.bind(0.5));
nav.addEventListener('mouseout', handlingHover.bind(1));

//Sticky navigation
const initialCoords = section1.getBoundingClientRect();
// console.log(initialCoords);
window.addEventListener('scroll', function() {
  console.log(window.scrollY);
  if (window.scrollY > initialCoords.top) {
    nav.classList.add('sticky');
  } else {
    nav.classList.remove('sticky');
  }
});

//Intersection, observer API
const obsCallback = function(entries, observer) {
  entries.forEach(entry => {
    console.log(entry);
  });
};
const obsOptions = {
  root: null, threshold: [0, 0.2]
};
const observer = new IntersectionObserver(obsCallback, obsOptions);
observer.observe(section1);

const header = document.querySelector('.header');
const navHeight = nav.getBoundingClientRect().height;
// console.log(navHeight);
const stickyNav = function(entries) {
  const [entry] = entries;
  if (!entry.isIntersecting) {
    nav.classList.add('sticky');
  } else {
    nav.classList.remove('sticky');
  }

};

const headerObserver = new IntersectionObserver(stickyNav, {
  root: null, threshold: 0, rootMargin: `-${navHeight}px`
});
headerObserver.observe(header);

//Reveal sections
const allSections = document.querySelectorAll('.section');
const revealSection = function(entries, observer) {
  const [entry] = entries;
  if (!entry.isIntersecting) return;
  entry.target.classList.remove('section--hidden');
  observer.unobserve(entry.target);
};
const sectionObserver = new IntersectionObserver(revealSection, {
  root: null, threshold: 0.15

});
allSections.forEach(function(section) {
  sectionObserver.observe(section);
  section.classList.add('section--hidden');
});

//Laazy loading imgs

const imgTargets = document.querySelectorAll('img[data-src]');
const loadImg = function(entries, observer) {
  const [entry] = entries;

  if (!entry.isIntersecting) return;

  entry.target.src = entry.target.dataset.src;
  entry.target.addEventListener('load', function() {
    entry.target.classList.remove('lazy-img');
  });
  observer.unobserve(entry.target);
};
const imgObserver = new IntersectionObserver(loadImg, {
  root: null, threshold: 0, rootMargin: '200px'
});

imgTargets.forEach(img => imgObserver.observe(img));

//Slider
const slider = function() {
  const dotContainer = document.querySelector('.dots');
  const slides = document.querySelectorAll('.slide');
  let curSlide = 0;
  const maxSlide = slides.length;
  const sliderBtnRight = document.querySelector('.slider__btn--right');
  const sliderBtnLeft = document.querySelector('.slider__btn--left');

  const createDots = function() {
    slides.forEach(function(_, i) {
      dotContainer.insertAdjacentHTML('beforeend', `<button class="dots__dot" data-slide="${i}"></button>`);
    });
  };

  const activateDot = function(slide) {
    document.querySelectorAll('.dots__dot').forEach(dot => dot.classList.remove('dots__dot--active'));

    document.querySelector(`.dots__dot[data-slide="${slide}"]`).classList.add('dots__dot--active');
  };
  const goToSlide = function(slide) {
    slides.forEach((s, i) => (s.style.transform = `translateX(${100 * (i - slide)}%)`));
  };

  const nextSlide = function() {
    if (curSlide === maxSlide - 1) {
      curSlide = 0;
    } else {
      curSlide++;
    }
    goToSlide(curSlide);
    activateDot(curSlide);
  };
  const prevSlide = function() {
    if (curSlide === 0) {
      curSlide = maxSlide - 1;
    } else {
      curSlide--;
    }
    goToSlide(curSlide);
    activateDot(curSlide);
  };
  const init = function() {
    createDots();
    goToSlide(0);
    activateDot(0);
  };
  init();
//Event Handlers
  sliderBtnRight.addEventListener('click', nextSlide);
  sliderBtnLeft.addEventListener('click', prevSlide);

  document.addEventListener('keydown', function(e) {
    // console.log(e);
    if (e.key === 'ArrowLeft') {
      prevSlide();
    } else if (e.key === 'ArrowRight') {
      nextSlide();
    }
  });


  dotContainer.addEventListener('click', function(e) {
    if (e.target.classList.contains('dots__dot')) {
      const slide = e.target.dataset.slide;
      goToSlide(slide);
      activateDot(slide);
    }
  });
};
slider();

