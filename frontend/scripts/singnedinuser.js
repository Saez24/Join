
const publicPages = ['index.html', 'privacy_policy.html', 'legal_notice.html', 'signup.html', 'help.html'];

/**
 * Fetches user data from the token and renders the user's name.
 */
async function checkAuth() {
    const token = localStorage.getItem("token");

    if (token) {
        try {
            let response = await fetch(BASE_URL + "auth/users/", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            let data = await response.json();
            const user = data.find(user => user.token === token);

            if (user) {
                document.getElementById('sidebarMenu').style.visibility = "visible";
                renderUserName(user);
            } else {
                // Wenn kein Benutzer mit diesem Token gefunden wird, dann logout
                handleLogout();
            }
        } catch (error) {
            console.error("Fehler:", error);
            handleLogout();
        }
    } else {
        handleLogout();
    }
}

// // Authentifizierungsstatus beim Laden der Seite prüfen
// window.onload = checkAuth;

/**
 * Renders the user's name in the DOM.
 * @param {string|null} name - The user's name. If null, displays 'Guest'.
 */
function renderUserName(user) {
    let userHTML = generateNameUserblock(user);
    renderNameToUserblock(userHTML);
}

/**
 * Renders the generated HTML for the user's name to the user block element.
 * @param {string} userHTML - The HTML string representing the user's name.
 */
function renderNameToUserblock(userHTML) {
    let userBlock = document.getElementById("userblock");
    userBlock.innerHTML = userHTML;
}

/**
 * Generates HTML for displaying the user's initials or 'Guest' if the name is null.
 * @param {string|null} name - The user's name. If null, displays 'Guest'.
 * @returns {string} The generated HTML string.
 */
function generateNameUserblock(user) {
    let firstInitial = 'G', lastInitial = '';
    let name = 'Guest';
    if (user && user.first_name && user.last_name) {
        firstInitial = user.first_name.charAt(0).toUpperCase();
        lastInitial = user.last_name.charAt(0).toUpperCase();
        name = `${user.first_name} ${user.last_name}`;
    }

    return /*html*/ `
        <button class="shortname"><h4 id="fullname" style="display: none;">${name || 'Guest'}</h4><h2>${firstInitial}${lastInitial}</h2></button>
    `;
}

/**
 * Logs out the current user and redirects to the index page.
 */
function handleLogout() {
    localStorage.removeItem("token");
    window.location.href = "index.html";
}

window.handleLogout = handleLogout;
