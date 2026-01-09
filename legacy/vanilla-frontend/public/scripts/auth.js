const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const showLogin = document.getElementById('showLogin');
const showRegister = document.getElementById('showRegister');

// VIEW SWITCHING
showLogin?.addEventListener('click', e => {
  e.preventDefault();
  registerForm.classList.add('auth__section--hidden');
  loginForm.classList.remove('auth__section--hidden');
  clearErrorMessage('register');
});

showRegister?.addEventListener('click', e => {
  e.preventDefault();
  loginForm.classList.add('auth__section--hidden');
  registerForm.classList.remove('auth__section--hidden');
  clearErrorMessage('login');
});

function showErrorMessage(msg, type) {
  const errorDiv = document.getElementById(type === 'login' ? 'loginError' : 'registerError');
  if (errorDiv) {
    errorDiv.innerHTML = `<p class="auth__message--error">${msg}</p>`;
  }
}

function clearErrorMessage(type) {
  const errorDiv = document.getElementById(type === 'login' ? 'loginError' : 'registerError');
  if (errorDiv) {
    errorDiv.innerHTML = '';
  }
}

function isOnlyLetters(text) {
  return /^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ]+$/.test(text);
}

// Email validation regex
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

// Password strength validation
function isValidPassword(password) {
  // At least 6 characters
  return password.length >= 6;
}

// LOGIN VALIDATION
loginForm?.addEventListener('submit', e => {
  clearErrorMessage('login');
  const emailInput = document.getElementById('email');
  const passInput = document.getElementById('password');
  let valid = true;
  emailInput.classList.remove('auth__input--error');
  passInput.classList.remove('auth__input--error');
  if (!emailInput.value.trim()) {
    emailInput.classList.add('auth__input--error');
    valid = false;
  } else if (!isValidEmail(emailInput.value.trim())) {
    emailInput.classList.add('auth__input--error');
    valid = false;
    showErrorMessage('Please enter a valid email address', 'login');
  }
  if (!passInput.value.trim()) {
    passInput.classList.add('auth__input--error');
    valid = false;
  }
  if (!valid) {
    e.preventDefault();
    if (!emailInput.value.trim() || !passInput.value.trim()) {
      showErrorMessage('Please fill in all fields', 'login');
    }
  }
});

// REGISTRATION VALIDATION
registerForm?.addEventListener('submit', e => {
  clearErrorMessage('register');
  const name = document.getElementById('name');
  const surname = document.getElementById('surname');
  const email = document.getElementById('regEmail');
  const password = document.getElementById('regPassword');
  const confirm = document.getElementById('confirmPassword');
  const inputs = [name, surname, email, password, confirm];

  let valid = true;
  let errorMessage = '';

  // Clear previous error styling
  inputs.forEach(input => {
    input.classList.remove('auth__input--error');
  });

  // Check for empty fields
  inputs.forEach(input => {
    if (!input.value.trim()) {
      input.classList.add('auth__input--error');
      valid = false;
    }
  });

  // Validate name - only letters
  if (name.value.trim() && !isOnlyLetters(name.value.trim())) {
    name.classList.add('auth__input--error');
    valid = false;
    errorMessage = 'Name must contain only letters';
  }

  // Validate surname - only letters
  if (surname.value.trim() && !isOnlyLetters(surname.value.trim())) {
    surname.classList.add('auth__input--error');
    valid = false;
    errorMessage = 'Surname must contain only letters';
  }

  // Validate email format
  if (email.value.trim() && !isValidEmail(email.value.trim())) {
    email.classList.add('auth__input--error');
    valid = false;
    errorMessage = 'Please enter a valid email address';
  }

  // Validate password strength
  if (password.value && !isValidPassword(password.value)) {
    password.classList.add('auth__input--error');
    valid = false;
    errorMessage = 'Password must be at least 6 characters long';
  }

  // Validate password confirmation
  if (password.value !== confirm.value) {
    confirm.classList.add('auth__input--error');
    valid = false;
    errorMessage = 'Passwords must be identical';
  }

  // Prevent form submission if validation fails
  if (!valid) {
    e.preventDefault();
    showErrorMessage(errorMessage || 'Please fill in all fields correctly', 'register');
  }
});
