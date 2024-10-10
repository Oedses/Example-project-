const logo = document.querySelector('img.companyLogo');
const cancelBtn = document.querySelector('button#cancel');
const firstIntroParagraph = document.querySelector('.intro > p');

const introContainer = document.querySelector('.intro');

const verifyButton = document.querySelector('button.verifyCode');
const sendNewCodeButton = document.querySelector('button.sendNewCode');
const changeEmailButton = document.querySelector('button.changeClaims');

const bottomButtonsContainer = document.querySelector('#attributeList + .buttons');
const topButtonsContainer = document.querySelector('.verificationControlContent .buttons');

const elementsToDelete = [
  cancelBtn,
  logo,
  firstIntroParagraph,
  document.querySelector('div#requiredFieldMissing'),
  document.querySelector('div#fieldIncorrect'),
  document.querySelector('div.verifying-modal'),
  document.querySelector('div#claimVerificationServerError'),
];

const capitalize = str => `${str.slice(0, 1)}${str.slice(1, str.length).toLowerCase()}`;

const redirectTo = (path) => {
  window.location.href = path;
};

const onBackClick = () => {
  const path = verifyButton.style.display === 'none' ?
    'https://TokyoCapital-frontend-acc.azurewebsites.net/login' :
    window.location.href;

  redirectTo(path);
};

const toggleButtons = show => {
  const heading = document.querySelector('.start-text');

  if (show) {
    topButtonsContainer.classList.remove('flex');
  } else {
    topButtonsContainer.classList.add('flex');
  }

  bottomButtonsContainer.style.position = show ? 'relative' : 'absolute';
  bottomButtonsContainer.style.opacity = show ? '1' : '0';

  heading.style.position = show ? 'absolute' : 'relative';
  heading.style.zIndex = show ? '-1' : '1';
};

const observer = new MutationObserver((mutations) => {
  mutations.forEach(() => {
    if (verifyButton.style.display === 'none') {
      toggleButtons(false);
      document.querySelector('input#email').removeAttribute("disabled");
    }

    if (
      (verifyButton.style.display !== 'none' ||
        changeEmailButton.style.display !== 'none')) {
      toggleButtons(true);

      document.querySelector('input#email').disabled = 'true';

      bottomButtonsContainer.style.position = 'absolute';
      bottomButtonsContainer.style.opacity = '0';

      const verifyInput = document.querySelector('input#emailVerificationCode');

      verifyInput.placeholder = capitalize(verifyInput.placeholder);

      [
        document.querySelector('div#requiredFieldMissing'),
        document.querySelector('div#fieldIncorrect'),
        // document.querySelector('#emailVerificationControl_error_message'),
        document.querySelector('div#claimVerificationServerError')
      ].forEach(el => { if (el) { el.style.position = 'relative'; el.style.zIndex = '0';}});
    }

    if (document.querySelector('#emailVerificationControl_success_message').style.display !== 'none' &&
      verifyButton.style.display === 'none') {
      toggleButtons(true);
      topButtonsContainer.classList.remove('flex');
      changeEmailButton.style.display = 'none';
      document.querySelector('.start-text').style.display = 'none';
      document.querySelector('input#email').style.display = 'none';

      [
        document.querySelector('div#requiredFieldMissing'),
        document.querySelector('div#fieldIncorrect'),
        document.querySelector('#emailVerificationControl_error_message'),
        document.querySelector('div#claimVerificationServerError')
      ].forEach(el => { if (el) { el.style.position = 'absolute'; el.style.zIndex = '-1';}});
    }
  });
});

elementsToDelete.forEach(el => { if (el) el.remove(); });

if (introContainer) {
  introContainer.insertAdjacentHTML('beforeend', `
    <h2 class='form__heading'>Forgot password</h2>
    <div class="form__description-wrapper">
      <p class='form__text start-text'>Enter your email address below to receive a password reset link.</p>
    </div>
  `);
}

if (topButtonsContainer) {
  const emailInput = document.querySelector('input#email');
  emailInput.placeholder = capitalize(emailInput.placeholder);

  topButtonsContainer.classList.add('flex');

  bottomButtonsContainer.style.position = 'absolute';
  bottomButtonsContainer.style.opacity = '0';

  const backIcon = `
    <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M0.666687 6.00016C0.666687 5.63197 0.965164 5.3335 1.33335 5.3335H14.6667C15.0349 5.3335 15.3334 5.63197 15.3334 6.00016C15.3334 6.36835 15.0349 6.66683 14.6667 6.66683H1.33335C0.965164 6.66683 0.666687 6.36835 0.666687 6.00016Z" fill="#808080"/>
      <path fill-rule="evenodd" clip-rule="evenodd" d="M6.47143 0.86201C6.73177 1.12236 6.73177 1.54447 6.47143 1.80482L2.27616 6.00008L6.47143 10.1953C6.73177 10.4557 6.73177 10.8778 6.47143 11.1382C6.21108 11.3985 5.78897 11.3985 5.52862 11.1382L0.861949 6.47149C0.6016 6.21114 0.6016 5.78903 0.861949 5.52868L5.52862 0.86201C5.78897 0.601661 6.21108 0.601661 6.47143 0.86201Z" fill="#808080"/>
    </svg>
  `;

  topButtonsContainer.insertAdjacentHTML('afterbegin', `
    <button id='back-button' onclick="onBackClick()">
      <a href='#'>
        ${backIcon}
        <span>Back</span>
      </a>
    </button>
  `);
}

observer.observe(verifyButton, { attributes: true, attributeFilter: ['style'] });
observer.observe(changeEmailButton, { attributes: true, attributeFilter: ['style'] });

sendNewCodeButton.addEventListener('click', () => {
  document.getElementById('emailVerificationControl_error_message').style = 'display: none !important';

  const buttons = document.querySelectorAll('.buttons #back-button, .buttons .verifyCode, .buttons .sendNewCode');


  const listToKeepShowing = [
    ...buttons,
    document.getElementById('emailVerificationControl_success_message'),
    document.getElementById('emailVerificationCode'),
  ];

  listToKeepShowing.forEach((button) => {
    button.style = 'display: inline !important';
  });
});
