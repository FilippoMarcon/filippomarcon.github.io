document.addEventListener("DOMContentLoaded", function() {
    // Gestione dell'invio del form di login
    document.getElementById('login-form').addEventListener('submit', function(event) {
        event.preventDefault(); // Evita il comportamento predefinito del form

        // Recupera l'username e la password inseriti dall'utente
        const usernameInput = document.getElementById('username').value;
        const passwordInput = document.getElementById('password').value;

        // Esegui eventuali controlli sulla validità dell'input (ad esempio, autenticazione)

        // Reindirizza all'index.html includendo l'username come parametro nell'URL
        window.location.href = `index.html?username=${usernameInput}`;
    });
});
