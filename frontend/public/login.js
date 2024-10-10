const introContainer = document.querySelector('.intro');

introContainer.insertAdjacentHTML('beforeend', `
  <h2 class='form__heading'>Welcome to TCX</h2>
  <div class="form__description-wrapper">
    <p class='form__text'>Log in using your email to continue.</p>
    <span class='form__text'>New here?</span> <a class='form__link' href='https://TokyoCapital-frontend-acc.azurewebsites.net/signup'>Request an investor account</a>
  </div>
`);
