document.addEventListener('DOMContentLoaded', function() {
  let secureMode = false;
  const page = window.location.pathname.split('/').pop();

  axios.get('https://127.0.0.1:8000/system-config/secure-mode') 
    .then(function (response) {
      secureMode = response.data.secure_mode;
      switch (page) {
        case 'index.html':
          app(secureMode);
          break;
        case 'login.html':
          login(secureMode);
          break;
        case 'register.html':
          register(secureMode);
          break;
    
        default:
          app(secureMode);
      }
    })
    .catch(function () {
      secureMode = false; 
      switch (page) {
        case 'index.html':
          app(secureMode);
          break;
        case 'login.html':
          login(secureMode);
          break;
        case 'register.html':
          register(secureMode);
          break;
    
        default:
          app(secureMode);
      }
    });
});

function app(secureMode) {
  console.log(secureMode ? 'Tryb bezpieczny włączony' : 'Tryb bezpieczny wyłączony');
  const baseUrl = secureMode ? 'https://127.0.0.1:8000/user' : 'http://127.0.0.1:8000/user';

  if (localStorage.getItem('isLoggedIn') === 'true') {
    document.getElementById('welcomeBar').innerHTML = `
      <div class="welcome-message">Witaj, ${localStorage.getItem('username')}!</div><br />
    `;
  } else {
    window.location.href = 'login.html';
    return;
  }

  document.getElementById('logoutButton').addEventListener('click', function() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    window.location.href = 'login.html';
    return;
  });

  axios
    .get(`${baseUrl}/users`)
    .then(function (response) {
      const users = response.data; 
      console.log(response.data);
      const userList = document.getElementById('userList');

      if (users.length > 0) {
        let userHTML = '<table class="listTable">';
        userHTML += `<tr class="listMainBar"><td>Id użytkownika</td><td>Nazwa użytkownika</td><td>Adres email użytkownika</td><td>Opcje</td></tr>`;
        users.forEach(user => {
          userHTML += `<tr class="listBar"><td>${user.id}</td><td>${user.username}</td><td>${escapeHTML(user.email)}</td><td><button class="logButton" data-username="${user.username}">Pokaż logi</button></td></tr>`;
        });
        userHTML += '</table>';
        userList.innerHTML = userHTML;

        document.querySelectorAll('.logButton').forEach(button => {
          button.addEventListener('click', function () {
            const username = this.getAttribute('data-username');
            showLogs(username, secureMode);
          });
        });
      } else {
        userList.innerHTML = '<p>Brak użytkowników do wyświetlenia.</p>';
      }
    })
    .catch(function (error) {
      console.error('Błąd podczas pobierania użytkowników:', error);
      document.getElementById('userList').innerHTML = '<p>Wystąpił błąd podczas ładowania listy użytkowników.</p>';
    });
}


function login(secureMode) {
  const baseUrl = secureMode ? 'https://127.0.0.1:8000/user' : 'http://127.0.0.1:8000/user';

  if (secureMode) {
    document.getElementById('captchaContent').style.display = 'block';
    generateCaptcha();
  } else {
    document.getElementById('captchaContent').style.display = 'none';
  }

  if (localStorage.getItem('isLoggedIn') === 'true') {
    window.location.href = 'index.html';
    return;
  } 

  document.getElementById('refreshCaptcha').addEventListener('click', function() {
    generateCaptcha();
  });

  document.getElementById('loginButton').addEventListener('click', function() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const userCaptcha = document.getElementById('captchaInput').value;

    if (userCaptcha !== captchaCode && secureMode) {
      document.getElementById('message').innerHTML = `<div class="message-bar-failed">Niepoprawny kod CAPTCHA!</div>`;
      return;
    }

    axios.post(`${baseUrl}/login`, {
      username: username,
      password: password
    })
    .then(function(response) {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('username', response.data.username); 
      document.getElementById('message').innerHTML = `<div class="message-bar-success">Zalogowano pomyślnie!</div>`;
      document.getElementById('loginForm').style.display = 'none';
      window.location.reload();
    })
    .catch(function(error) {
      document.getElementById('message').innerHTML = `<div class="message-bar-failed">Nieprawidłowa nazwa użytkownika lub hasło</div>`;
    }); 
  });
}

function register(secureMode) {
  const baseUrl = secureMode ? 'https://127.0.0.1:8000/user' : 'http://127.0.0.1:8000/user';

  if (secureMode) {
    document.getElementById('captchaContent').style.display = 'block';
    generateCaptcha();
  } else {
    document.getElementById('captchaContent').style.display = 'none';
  }

  if (localStorage.getItem('isLoggedIn') === 'true') {
    window.location.href = 'index.html';
    return;
  } 

  document.getElementById('refreshCaptcha').addEventListener('click', function() {
    generateCaptcha();
  });

  document.getElementById('registerButton').addEventListener('click', function() {
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;
    const userCaptcha = document.getElementById('captchaInput').value;

    if(!username || !email || !password || !passwordConfirm) {
      document.getElementById('message').innerHTML = `<div class="message-bar-failed">Musisz wypełnić wszystkie pola!</div>`;
      return;
    }

    if (password !== passwordConfirm) {
      document.getElementById('message').innerHTML = `<div class="message-bar-failed">Musisz wpisać identyczne hasła!</div>`;
      return;
    }

    if (userCaptcha !== captchaCode && secureMode) {
      document.getElementById('message').innerHTML = `<div class="message-bar-failed">Niepoprawny kod CAPTCHA!</div>`;
      return;
    }

    axios.post(`${baseUrl}/register`, {
      username: username,
      email: email,
      password: password
    })
    .then(function(response) {
      document.getElementById('message').innerHTML = `<div class="message-bar-success">Zarejestrowano pomyślnie!</div>`;
      window.location.href = 'index.html';
    })
    .catch(function(error) {
      document.getElementById('message').innerHTML = `<div class="message-bar-failed">Wystąpił błąd podczas rejestracji!</div>`;
    }); 
  });
}

function showLogs(username, secureMode) {
  const baseUrl = secureMode ? 'https://127.0.0.1:8000/user' : 'http://127.0.0.1:8000/user';
  const popup = document.getElementById('logPopup');
  const logContent = document.getElementById('logContent');
  const closePopup = document.getElementById('closePopup');


  popup.style.display = 'block';

  axios.get(`${baseUrl}/logs/${username}.txt`)
    .then(function (response) {
      logContent.innerHTML = `<div class="popupBar">Logi użytkownika <b>${username}</b></div>`;
      logContent.innerHTML += `<pre class="popupLogs">${response.data}</pre>`;
    })
    .catch(function (error) {
      logContent.innerHTML = `<div class="popupBar">Logi użytkownika <b>${username}</b></div>`;
      logContent.innerHTML += '<pre class="popupLogs">Nie udało się wczytać logów użytkownika.</pre>';
    });

  closePopup.addEventListener('click', function () {
    popup.style.display = 'none';
    logContent.innerHTML = `<div class="popupBar">Logi użytkownika <b>${username}</b></div>`;
      logContent.innerHTML += '<pre class="popupLogs">Logi użytkownika wczytywane...</pre>';
  });

  window.addEventListener('click', function (event) {
    if (event.target === popup) {
      popup.style.display = 'none';
      logContent.innerHTML = `<div class="popupBar">Logi użytkownika <b>${username}</b></div>`;
      logContent.innerHTML += '<pre class="popupLogs">Logi użytkownika wczytywane...</pre>';
    }
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

function escapeHTML(str) {
  return str.replace(/[&<>"']/g, function (match) {
    const escape = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return escape[match];
  });
}