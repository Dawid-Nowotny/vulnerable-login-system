document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('loginButton').addEventListener('click', function () {
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
  
      document.getElementById('data').innerHTML = `
        <p>Wysłane dane:</p>
        <p>Email: ${email}</p>
      `;

      axios.post('http://127.0.0.1:8000/user/login', {
        username: email,
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