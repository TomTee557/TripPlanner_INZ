<?php
// if (session_status() === PHP_SESSION_NONE) {
//     session_start();
// }

// Session is initialized by DefaultController::auth() via SecurityHelper::initSession()
// No need to start session here manually
if (!isset($messages)) $messages = [];
if (!isset($formType)) $formType = null;
if (empty($messages) && !empty($_SESSION['messages'])) {
    $messages = $_SESSION['messages'];
    unset($_SESSION['messages']);
}
if (empty($formType) && !empty($_SESSION['formType'])) {
    $formType = $_SESSION['formType'];
    unset($_SESSION['formType']);
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Trip Planner - Auth</title>
  <link rel="stylesheet" href="/public/styles/global.css" />
  <link rel="stylesheet" href="/public/styles/auth.css" />
<script src="/public/scripts/auth.js" defer></script>
</head>
<body class="auth">
  <div class="auth__background"></div>

  <div class="auth__column">
    <div class="auth__container">
      <div class="auth__content">
        <img src="/public/assets/logo.png" alt="Trip Planner Logo" class="auth__logo"/>

        <!-- LOGIN FORM -->
        <form class="auth__form" id="loginForm" method="POST" action="/login">
        <div class="auth__section" id="loginSection">
          <h2 class="auth__title">Log in</h2>
          <label for="email" class="auth__label">Email:</label>
          <input type="text" id="email" name="email" class="auth__input" required />

          <label for="password" class="auth__label">Password:</label>
          <input type="password" id="password" name="password" class="auth__input" required />

          <button type="submit" class="auth__button auth__button--login">Log in</button>
          <p class="auth__switch">Don’t have an account? <a href="#" id="showRegister">Register</a></p>
          <!-- login messages -->
          <div id="loginError" class="auth__message">
            <?php if (!empty($messages) && ($formType ?? '') === 'login'): ?>
              <?php foreach ($messages as $msg): ?>
                <?php
                  $successMessages = [
                    'Registration successful! Now please log in.',
                    'You have been successfully logged out.',
                    'You have been logged out due to inactivity.',
                    'You have been logged out.'
                  ];
                  $messageClass = in_array($msg, $successMessages) 
                    ? 'auth__message--success' 
                    : 'auth__message--error';
                ?>
                <p class="<?= $messageClass ?>"><?= $msg ?></p>
              <?php endforeach; ?>
            <?php endif; ?>
          </div>
        </div>
      </form>

      <!-- REGISTRATION FORM -->
      <form class="auth__form auth__section--hidden" id="registerForm" method="POST" action="/register">
        <div class="auth__section" id="registerSection">
          <h2 class="auth__title">Register</h2>
          <label class="auth__label">Name:</label>
          <input type="text" id="name" name="name" class="auth__input" required />

          <label class="auth__label">Surname:</label>
          <input type="text" id="surname" name="surname" class="auth__input" required />

          <label class="auth__label">Email:</label>
          <input type="text" id="regEmail" name="regEmail" class="auth__input" required />

          <label class="auth__label">Password:</label>
          <input type="password" id="regPassword" name="regPassword" class="auth__input" required />

          <label class="auth__label">Confirm password:</label>
          <input type="password" id="confirmPassword" name="confirmPassword" class="auth__input" required />

          <button type="submit" class="auth__button auth__button--register">Register</button>
          <p class="auth__switch"><a href="#" id="showLogin">Back to log in</a></p>
          <!-- Registration messages -->
          <div id="registerError" class="auth__message">
            <?php if (!empty($messages) && ($formType ?? '') === 'register'): ?>
              <?php foreach ($messages as $msg): ?>
                <p class="auth__message--error"><?= $msg ?></p>
              <?php endforeach; ?>
            <?php endif; ?>
          </div>
        </div>
      </form>
      </div>
    </div>
  </div>


  <script>
    document.addEventListener('DOMContentLoaded', function() {
      <?php if (($formType ?? '') === 'register'): ?>
        // If formType is 'register', show registration form
        document.getElementById('registerForm').classList.remove('auth__section--hidden');
        document.getElementById('loginForm').classList.add('auth__section--hidden');
      <?php endif; ?>
    });
  </script>
</body>
</html>
