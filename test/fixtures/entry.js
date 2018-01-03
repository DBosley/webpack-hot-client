'use strict';

/* eslint no-console: off */
/* global document */

const target = document.querySelector('#target');
target.innerHTML = 'entry!';

if (module.hot) {
  module.hot.accept((err) => {
    if (err) {
      console.error('Cannot apply HMR update.', err);
    }
  });
}
