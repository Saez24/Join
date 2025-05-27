const BASE_URL = "http://127.0.0.1:8000/api/auth/login/";

let login = document.getElementById("login");
let errorContainer = document.getElementById('error');
let errorInput = document.getElementById('password');

/**
 * Handles the login button click event, sends login request to Django backend,
 * stores the token in LocalStorage, and redirects on success.
 */
login.addEventListener('click', async function (event) {
    event.preventDefault();

    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;

    try {
        let response = await fetch(BASE_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email: email, password: password })
        });

        let data = await response.json();

        if (response.ok) {
            // Store token and redirect
            localStorage.setItem("token", data.token);
            window.location.href = "summary.html";
        } else {
            // Show error
            errorContainer.style.display = 'block';
            errorContainer.innerText = "Login fehlgeschlagen!";
            errorInput.style.borderColor = '#ff8190';
        }
    } catch (error) {
        console.error("Fehler:", error);
        errorContainer.style.display = 'block';
        errorContainer.innerText = "Ein Fehler ist aufgetreten!";
        errorInput.style.borderColor = '#ff8190';
    }
});


// /**
//  * Handles the guest login button click event, signs in the user anonymously,
//  * and redirects to the summary page on success. Displays error message on failure.
//  * 
//  * @param {Event} event - The click event.
//  */
// guestLogin.addEventListener('click', function (event) {
//     event.preventDefault();

//     signInAnonymously(auth)
//         .then(() => {
//             window.location.href = "summary.html";
//         })
//         .catch((error) => {
//             let errorCode = error.code;
//             let errorMessage = error.message;
//         });
// });

/**
 * Sets the background image of the password input field to a lock icon.
 */
function loadPasswordImage() {
    let passwordImage = document.getElementById('password');
    passwordImage.style.backgroundImage = 'url(./assets/img/lock.png)';
};

window.loadPasswordImage = loadPasswordImage;

/**
 * Sets the background image of the password input field to a visibility icon.
 */
function showPasswordImage() {
    let passwordImage = document.getElementById('password');
    passwordImage.style.backgroundImage = 'url(./assets/img/visibility.png)';
};

window.showPasswordImage = showPasswordImage;

/**
 * Hides the password image by setting a different background image.
 */
function hidePasswordImage() {
    let passwordImage = document.getElementById('password');
    passwordImage.style.backgroundImage = 'url(./assets/img/visibility_off.png)';
};

window.hidePasswordImage = hidePasswordImage;

/**
 * Toggles the password visibility.
 */
function showPassword() {
    let x = document.getElementById("password");
    if (x.type === "password") {
        x.type = "text";
    } else {
        x.type = "password";
    }
};

window.showPassword = showPassword;

/**
 * Sets the password input type to "password".
 */
function hidePassword() {
    let x = document.getElementById("password");
    x.type = "password";
};

window.hidePassword = hidePassword;

/**
 * Handles the click event on the password input field to toggle visibility
 * when clicking on the background image area.
 * @param {MouseEvent} event - The mouse event.
 */
function handleShowpasswordClick(event) {
    let input = document.getElementById("password");
    let clickX = event.clientX;
    let inputRight = input.getBoundingClientRect().right;

    if (clickX >= inputRight - 30) {
        showPassword();
        hidePasswordImage();
    }
};

window.handleShowpasswordClick = handleShowpasswordClick;

