const introContainer = document.querySelector('.intro');

introContainer.insertAdjacentHTML('beforeend', `
  <h2 class='form__heading'>Security verification</h2>
  <div class="form__description-wrapper">
    <p class='form__text'>Enter the verification code in the email to continue.</p>
  </div>
`);

const cancelButton = document.querySelector('.buttons #cancel');

if (cancelButton) {
  cancelButton.style.display = 'none';
}

const sendVerificationCodeButton = document.querySelector('button#ReadOnlyEmail_ver_but_send');

if (sendVerificationCodeButton) {
  sendVerificationCodeButton.addEventListener('click', () => {
    document.querySelector('#ReadOnlyEmail_ver_input_label').style.display = 'block !important';
  });
}

