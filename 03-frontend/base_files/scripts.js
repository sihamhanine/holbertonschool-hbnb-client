// Fonction pour obtenir la valeur d'un cookie par son nom
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

// Fonction pour vérifier l'authentification de l'utilisateur
function checkAuthentication() {
    const token = getCookie('token');
    const loginLink = document.getElementById('login-link');

    if (!token) {
        loginLink.style.display = 'block';
    } else {
        loginLink.style.display = 'none';
        return token;
    }
    return null;
}

// Fonction pour gérer la soumission du formulaire de connexion
async function loginUser(email, password) {
    try {
        const response = await fetch('http://127.0.0.1:5000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const data = await response.json();
            document.cookie = `token=${data.access_token}; path=/`;
            window.location.href = 'index.html';
        } else {
            const error = await response.json();
            alert('Login échoué : ' + error.msg);
        }
    } catch (error) {
        alert('Une erreur est survenue : ' + error.message);
    }
}

// Fonction pour récupérer l'ID du lieu depuis l'URL
function getPlaceIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

// Fonction pour récupérer les lieux
async function fetchPlaces(token) {
    try {
        const response = await fetch('http://127.0.0.1:5000/places', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const places = await response.json();
            displayPlaces(places);
        } else {
            alert('Erreur lors de la récupération des lieux');
        }
    } catch (error) {
        alert('Une erreur est survenue : ' + error.message);
    }
}

// Fonction pour afficher les lieux
function displayPlaces(places) {
    const placesList = document.getElementById('places-list');
    placesList.innerHTML = '';
    places.forEach(place => {
        const placeElement = document.createElement('div');
        placeElement.innerHTML = `
            <h2>${place.name}</h2>
            <p>${place.description}</p>
            <p>${place.location}</p>
        `;
        placesList.appendChild(placeElement);
    });
}

// Fonction pour gérer le filtre des lieux par pays
document.getElementById('country-filter').addEventListener('change', (event) => {
    const selectedCountry = event.target.value;
    const places = Array.from(document.querySelectorAll('#places-list div'));
    places.forEach(place => {
        const placeLocation = place.querySelector('p').textContent; // Assuming location is in a paragraph
        if (selectedCountry === 'All' || placeLocation.includes(selectedCountry)) {
            place.style.display = 'block';
        } else {
            place.style.display = 'none';
        }
    });
});

// Fonction pour récupérer les détails du lieu
async function fetchPlaceDetails(token, placeId) {
    try {
        const response = await fetch(`http://127.0.0.1:5000/places/${placeId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const place = await response.json();
            displayPlaceDetails(place);
        } else {
            alert('Erreur lors de la récupération des détails du lieu');
        }
    } catch (error) {
        alert('Une erreur est survenue : ' + error.message);
    }
}

// Fonction pour afficher les détails du lieu
function displayPlaceDetails(place) {
    const placeDetails = document.getElementById('place-details');
    placeDetails.innerHTML = `
        <h1>${place.name}</h1>
        <p>${place.description}</p>
        <p>${place.location}</p>
        <div>${place.images.map(img => `<img src="${img}" alt="${place.name}">`).join('')}</div>
    `;
    const addReviewSection = document.getElementById('add-review');
    addReviewSection.style.display = getCookie('token') ? 'block' : 'none';
}

// Fonction pour soumettre une revue
async function submitReview(token, placeId, reviewText) {
    try {
        const response = await fetch(`http://127.0.0.1:5000/places/${placeId}/reviews`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ review: reviewText })
        });

        if (response.ok) {
            alert('Revue soumise avec succès !');
            document.getElementById('review-form').reset();
        } else {
            alert('Échec de la soumission de la revue');
        }
    } catch (error) {
        alert('Une erreur est survenue : ' + error.message);
    }
}

// Fonction pour vérifier l'authentification et récupérer les lieux ou détails du lieu
function initPage() {
    const token = checkAuthentication();

    if (document.getElementById('login-form')) {
        document.getElementById('login-form').addEventListener('submit', async (event) => {
            event.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            await loginUser(email, password);
        });
    }

    if (document.getElementById('places-list')) {
        fetchPlaces(token);
    }

    if (document.getElementById('place-details')) {
        const placeId = getPlaceIdFromURL();
        if (token) {
            fetchPlaceDetails(token, placeId);
        }
    }

    if (document.getElementById('review-form')) {
        const placeId = getPlaceIdFromURL();
        document.getElementById('review-form').addEventListener('submit', async (event) => {
            event.preventDefault();
            const reviewText = document.getElementById('review-text').value;
            await submitReview(token, placeId, reviewText);
        });
    }
}

document.addEventListener('DOMContentLoaded', initPage);
