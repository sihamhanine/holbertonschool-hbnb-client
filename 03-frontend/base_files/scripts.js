/* 
  This is a SAMPLE FILE to get you started.
  Please, follow the project instructions to complete the tasks.
*/

document.addEventListener('DOMContentLoaded', () => {
  /* DO SOMETHING */
    const loginForm = document.getElementById('login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('https://your-api-url/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });

                if (response.ok) {
                    const data = await response.json();
                    // Stocker le jeton JWT dans un cookie
                    document.cookie = `token=${data.access_token}; path=/`;
                    // Rediriger vers la page principale
                    window.location.href = 'index.html';
                } else {
                    // Afficher un message d'erreur si la connexion échoue
                    alert('Échec de la connexion : ' + response.statusText);
                }
            } catch (error) {
                console.error('Erreur lors de la connexion :', error);
                alert('Une erreur est survenue lors de la connexion.');
            }
        });
    }

// Fonction pour vérifier l'authentification
function checkAuthentication() {
    const token = getCookie('token');
    const loginLink = document.getElementById('login-link');

    if (!token) {
        loginLink.style.display = 'block';
    } else {
        loginLink.style.display = 'none';
        fetchPlaces(token);
    }
}

// Fonction pour obtenir la valeur d'un cookie par son nom
function getCookie(name) {
    const cookies = document.cookie.split('; ');
    for (let cookie of cookies) {
        const [key, value] = cookie.split('=');
        if (key === name) {
            return value;
        }
    }
    return null;
}

// Appeler la fonction au chargement de la page
document.addEventListener('DOMContentLoaded', checkAuthentication);
});
