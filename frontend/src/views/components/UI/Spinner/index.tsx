import React from 'react';

import './spinner.scss';

import spinner from './../assets/spinner.svg';

const Spinner = () => (
  <section className="spinner">
    <img src={spinner} alt="Loading" />
  </section>
);

export { Spinner };

