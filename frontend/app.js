document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('loginButton').addEventListener('click', function () {
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
  
      axios.post('https://127.0.0.1:8000/login', {
        email: email,
        password: password
      })
      .then(function (response) {
        console.log('Zalogowano:', response.data);
        document.getElementById('message').innerHTML = `<p style="color: green;">Zalogowano pomyślnie!</p>`;
      })
      .catch(function (error) {
        console.error('Błąd logowania:', error);
        document.getElementById('message').innerHTML = `Błąd: Nieprawidłowy email lub hasło`;
      });
    });
  });