document.addEventListener('DOMContentLoaded', function() {
  let secureMode = false;

  axios.get('https://127.0.0.1:8000/user/secure-mode') 
    .then(function (response) {
      secureMode = response.data.secure_mode;
      app(secureMode);
    })
    .catch(function () {
      secureMode = false; 
      app(secureMode);
    });
});

function app(secureMode) {
  console.log(secureMode ? 'Tryb bezpieczny włączony' : 'Tryb bezpieczny wyłączony');
  const baseUrl = secureMode ? 'https://127.0.0.1:8000/user' : 'http://127.0.0.1:8000/user';

  if (secureMode) {
    document.getElementById('captchaContent').style.display = 'block';
  } else {
    document.getElementById('captchaContent').style.display = 'none';
  }

  document.getElementById('refreshCaptcha').addEventListener('click', function() {
    generateCaptcha();
  });

  document.getElementById('logoutButton').addEventListener('click', function() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    window.location.reload();
  });

  if (localStorage.getItem('isLoggedIn') === 'true') {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('loginContent').style.display = 'block';

    document.getElementById('data').innerHTML = `
      <div class="welcome-message">Witaj, ${localStorage.getItem('username')}!</div><br />
    `;


    return;
  } else {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('loginContent').style.display = 'none';
    generateCaptcha();
  }

  document.getElementById('loginButton').addEventListener('click', function() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const userCaptcha = document.getElementById('captchaInput').value;

    if (userCaptcha !== captchaCode && secureMode) {
      document.getElementById('message').innerHTML = `<div class="message-bar-failed">Niepoprawny kod CAPTCHA!</div>`;
      return;
    }

    axios.post(`${baseUrl}/login`, {
      username: email,
      password: password
    })
    .then(function(response) {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('username', response.data.username); 
      document.getElementById('loginForm').style.display = 'none';
      document.getElementById('message').innerHTML = `<div class="message-bar-success">Zalogowano pomyślnie!</div>`;
      window.location.reload();
    })
    .catch(function(error) {
      document.getElementById('message').innerHTML = `<div class="message-bar-failed">Nieprawidłowy email lub hasło</div>`;
    }); 
  });

  
}

let captchaCode = '';

function generateCaptcha() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  captchaCode = '';
  for (let i = 0; i < 6; i++) {
    captchaCode += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  const canvas = document.getElementById('captchaCanvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 210;
  canvas.height = 29;

  ctx.fillStyle = '#202020';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = '20px Arial';
  ctx.fillStyle = '#ffdd00';
  ctx.fillText(captchaCode, 34, 22);

  for (let i = 0; i < 5; i++) {
    ctx.strokeStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.5)`;
    ctx.beginPath();
    ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
    ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
    ctx.stroke();
  }
}