const container = document.querySelector('.intro');
const cancelButton = document.querySelector('button#cancel');

const newPasswordInput = document.querySelector('input#newPassword');
const reEnterPasswordInput = document.querySelector('input#reenterPassword');

const elementsToRemove = [
  cancelButton,
  document.querySelector('div#requiredFieldMissing'),
  document.querySelector('div#fieldIncorrect'),
  document.querySelector('div.verifying-modal'),
  document.querySelector('div#claimVerificationServerError'),
];

elementsToRemove.forEach(el => { if (el) el.remove(); });

container.insertAdjacentHTML('beforebegin', `
  <h2 class='form__heading'>Set password</h2>
`);

const capitalizeString = str => `${str.slice(0, 1)}${str.slice(1, str.length).toLowerCase()}`;

newPasswordInput.placeholder = capitalizeString(newPasswordInput.placeholder);
reEnterPasswordInput.placeholder = capitalizeString(reEnterPasswordInput.placeholder);