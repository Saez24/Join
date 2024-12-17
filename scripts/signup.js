const BASE_URL = "http://127.0.0.1:8000/api/";

let signup = document.getElementById("signup");
let errorContainer = document.getElementById('error-message');

/**
 * Validates that the password and confirm password fields match and checks the password length.
 * 
 * @param {string} password - The password entered by the user.
 * @param {string} confirmPassword - The confirmation password entered by the user.
 * @param {HTMLElement} errorContainer - The container to display error messages.
 * @returns {boolean} - Returns true if passwords match and the password length is sufficient, otherwise false.
 */
function validatePasswords(password, confirmPassword, errorContainer) {
    if (password.length < 5) {
        errorContainer.innerHTML = 'The password must be at least 5 characters long.';
        errorContainer.style.display = 'block';
        return false;
    }
    if (password !== confirmPassword) {
        errorContainer.innerHTML = 'The passwords do not match.';
        errorContainer.style.display = 'block';
        return false;
    }
    return true;
}


/**
 * Validates that the name field contains both first and last name.
 * 
 * @param {string} name - The name entered by the user.
 * @param {HTMLElement} errorContainer - The container to display error messages.
 * @returns {boolean} - Returns true if the name contains at least two words, otherwise false.
 */
function validateName(name, errorContainer) {
    if (name.split(' ').length < 2) {
        errorContainer.innerHTML = 'Please enter your first and last name.';
        errorContainer.style.display = 'block';
        return false;
    }
    return true;
};

/**
 * Validates the email format and updates the error container if the email is invalid.
 * @param {string} email - The email address to validate.
 * @param {HTMLElement} errorContainer - The container element to display error messages.
 * @returns {boolean} True if the email is valid, false otherwise.
 */
function validateEmail(email, errorContainer) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (email.length < 2) {
        errorContainer.innerHTML = 'Please enter your email.';
        errorContainer.style.display = 'block';
        return false;
    }

    if (!emailPattern.test(email)) {
        errorContainer.innerHTML = 'Please enter a valid email address.';
        errorContainer.style.display = 'block';
        return false;
    }

    errorContainer.innerHTML = '';
    errorContainer.style.display = 'none';
    return true;
};

async function checkSubmit(name, email, password, repeated_password, errorContainer) {
    try {
        // Benutzerliste abrufen und prüfen, ob die E-Mail bereits existiert
        let response = await fetch(`${BASE_URL}auth/users/`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            }
        });

        if (response.ok) {
            let data = await response.json();
            let userExists = false;

            // Überprüfen, ob ein Benutzer mit der angegebenen E-Mail vorhanden ist
            for (let user of data) {
                if (user.email === email) {
                    userExists = true;
                    break;
                }
            }

            if (userExists) {
                // Wenn die E-Mail bereits existiert, Fehlermeldung anzeigen
                errorContainer.innerHTML = 'Email already exists.';
                errorContainer.style.display = 'block';
            } else {
                // Wenn die E-Mail nicht existiert, handleFormSubmission ausführen
                await handleFormSubmission(name, email, password, repeated_password, errorContainer);
            }
        }
    } catch (error) {
        console.error('Fehler beim Abrufen der Benutzer:', error);
    }
}

/**
 * Handles the form submission by creating a new user with email and password.
 * 
 * @param {string} email - The email entered by the user.
 * @param {string} password - The password entered by the user.
 * @param {HTMLElement} errorContainer - The container to display error messages.
 */
async function handleFormSubmission(name, email, password, repeated_password, errorContainer, path = "auth/registration/") {
    const username = name.split(' ').join('').toLowerCase();
    const data = {
        username: username,
        email: email,
        password: password,
        repeated_password: repeated_password
    };

    try {
        let response = await fetch(BASE_URL + path, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        let responseToJson = await response.json();
        if (response.ok) {
            const userId = await getUserIdByEmail(email);
            if (userId) {
                await createFirstNameLastName(userId, name, username);
                window.location.href = "index.html";
            } else {
                console.error("Fehler beim Abrufen der Initialisierungsdaten.");
            }
        } else {
            console.error('Benutzer konnte nicht gefunden werden.');
        }

        return responseToJson;
    } catch (error) {
        console.error('Fehler bei der Anfrage:', error);
    }
};

async function getUserIdByEmail(email) {
    try {
        let response = await fetch(`${BASE_URL}auth/users?email=${email}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            }
        });

        if (response.ok) {
            let data = await response.json();
            if (data && data.length > 0) {
                for (let user of data) {
                    if (user.email === email) {

                        return user.id;
                    }
                }
            }
        }
        return null;
    } catch (error) {
        console.error('Fehler beim Abrufen der Benutzer-ID:', error);
        return null;
    }
}


async function addFirstNameLastName(path, data) {
    let response = await fetch(BASE_URL + path, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
    });

    return await response.json();
}

async function createFirstNameLastName(userId, name, username) {
    let firstName = name.split(' ')[0];
    let lastName = name.split(' ')[1];
    const path = `auth/users/${userId}/`;

    await addFirstNameLastName(path, { 'username': username, 'first_name': firstName, 'last_name': lastName });
}

/**
 * Validates that the privacy policy checkbox is checked.
 * 
 * @param {HTMLElement} privacyCheckbox - The privacy policy checkbox element.
 * @param {HTMLElement} errorContainer - The container to display error messages.
 * @returns {boolean} - Returns true if the checkbox is checked, otherwise false.
 */
function validatePrivacyCheckbox(privacyCheckbox, errorContainer) {
    if (!privacyCheckbox.checked) {
        errorContainer.innerHTML = 'Please accept the privacy policy.';
        errorContainer.style.display = 'block';
        return false;
    }
    return true;
};

/**
 * Main event listener for handling the form submission process.
 * 
 * @param {Event} event - The event object.
 */
signup.addEventListener('click', function (event) {
    event.preventDefault();

    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;
    let repeated_password = document.getElementById("confirmpassword").value;
    let privacyCheckbox = document.getElementById("checkbox-privacy");
    let name = document.getElementById('name').value.trim();

    errorContainer.innerHTML = '';
    errorContainer.style.display = 'none';
    if (!validateName(name, errorContainer)) return;
    if (!validateEmail(email, errorContainer)) return;
    if (!validatePasswords(password, repeated_password, errorContainer)) return;
    if (!validatePrivacyCheckbox(privacyCheckbox, errorContainer)) return;

    checkSubmit(name, email, password, repeated_password, errorContainer);
    handleSubmit();
});


/**
 * Handles the submission of the form.
 * 
 * This function reads values from the input fields, creates a new name object,
 * and adds it using the addName function.
 */
let isInitialized = false;  // Initialisierungsstatus

async function handleSubmit() {
    await checkInitialization();
}

async function initializeStandardData() {
    await Promise.all([
        createStandardCategories(),
        createStandardTaskStatus(),
        createPriority()
    ]);
}

async function checkInitialization() {
    try {
        let response = await fetch(`${BASE_URL}categories/`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            }
        });

        if (response.ok) {
            let data = await response.json();
            // Prüfen, ob das Array "categories" weniger als 1 Element hat
            if (Array.isArray(data) && data.length < 1) {
                // Initialisierung ausführen, wenn keine Kategorien vorhanden sind
                await initializeStandardData();
            }
        } else {
            console.error("Fehler beim Abrufen der Initialisierungsdaten.");
        }
    } catch (error) {
        console.error("Fehler bei der Anfrage:", error);
    }
}



async function createStandardCategories() {
    let standardCategories = [
        { name: "Finance" },
        { name: "IT" },
        { name: "Sales" },
        { name: "HR" },
        { name: "Marketing" },
        { name: "Operations" },
        { name: "Product" }
    ];

    for (let category of standardCategories) {
        let response = await fetch(BASE_URL + "categories/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(category)
        });

        if (!response.ok) {
            console.error(`Fehler beim Erstellen der Kategorie: ${category.name}`);
        }
    }
}

async function createStandardTaskStatus() {
    let standardTaskstatus = [
        { name: "todo" },
        { name: "inprogress" },
        { name: "done" },
        { name: "awaitfeedback" }
    ];

    for (let taskstatus of standardTaskstatus) {
        let response = await fetch(BASE_URL + "taskstatus/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(taskstatus)
        });

        if (!response.ok) {
            console.error(`Fehler beim Erstellen des Taskstatus: ${taskstatus.name}`);
        }
    }
}

async function createPriority() {
    let standardPrio = [
        { name: "urgent" },
        { name: "medium" },
        { name: "low" }
    ];

    for (let prio of standardPrio) {
        let response = await fetch(BASE_URL + "priority/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(prio)
        });

        if (!response.ok) {
            console.error(`Fehler beim Erstellen der Priorität: ${prio.name}`);
        }
    }
}
