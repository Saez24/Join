window.onload = () => getNames();
const BASE_URL = "http://127.0.0.1:8000/api/"
let currentTaskId = null;
let names
let category
let id = 0;
let subtaskCounter = 0;
let counter = 0;
let activeButton = null;

let buttonImages = {
    urgent: './assets/img/prio_alta.png',
    medium: './assets/img/prio_media.png',
    low: './assets/img/prio_baja.png'
};

let prioImages = {
    'edit-urgent': './assets/img/prio_alta.png',
    'edit-medium': './assets/img/prio_media.png',
    'edit-low': './assets/img/prio_baja.png'
};

let buttonNames = {
    urgent: 'Urgent',
    medium: 'Medium',
    low: 'Low'
};

let buttonColors = {
    urgent: { background: '#FF3D00', color: '#FFFFFF' },
    medium: { background: '#FFA800', color: '#FFFFFF' },
    low: { background: '#7AE229', color: '#FFFFFF' }
};

let CategoryColors = {
    Finance: { background: '#FF7A00', color: '#FFFFFF' },
    IT: { background: '#FF5EB3', color: '#FFFFFF' },
    Sales: { background: '#6E52FF', color: '#FFFFFF' },
    HR: { background: '#9327FF', color: '#FFFFFF' },
    Marketing: { background: '#00BEE8', color: '#FFFFFF' },
    Operations: { background: '#1FD7C1', color: '#FFFFFF' },
    Product: { background: '#FF745E', color: '#FFFFFF' }
};

let tasks = [];
let subtaskStatus = {};
let activeSearch = false;
let i = 0;

/**
 * Fetches the sidebar HTML content and injects it into the sidebar container.
 * Also, sets the 'selected' class for the button corresponding to the current page.
 */
fetch('./assets/templates/sidebar.html')
    .then(response => response.text())
    .then(html => {
        document.getElementById('sidebarContainer').innerHTML = html;
        let currentPage = window.location.pathname;
        let pages = ['add_task', 'board', 'summary', 'contacts', 'privacy_policy', 'legal_notice'];
        for (let i = 0; i < pages.length; i++) {
            let buttonId = pages[i].replaceAll("'", "");
            if (currentPage.includes(buttonId)) {
                let button = document.getElementById(buttonId + 'Btn');
                if (button) {
                    button.classList.add('selected');
                }
            }
        }
    })
    .catch(error => console.error('Error fetching sidebar:', error));

function selectSummary() {
    window.location.href = "summary.html";
}


function selectAddTask() {
    window.location.href = "add_task.html";
}


function selectBoard() {
    window.location.href = "board.html";
}


function selectContacts() {
    window.location.href = "contacts.html";
}


function selectPrivacyPolicy() {
    window.location.href = "privacy_policy.html";
}


function selectLegalNotice() {
    window.location.href = "legal_notice.html";
}

function selectIndex() {
    window.location.href = "index.html";
}

function selectHelp() {
    window.location.href = "help.html";
}

function showSubmenu() {
    let submenu = document.getElementById('submenu');
    if (!submenu.classList.contains('show-submenu')) {
        submenu.classList.remove('d-none');
        setTimeout(function () {
            submenu.classList.add('show-submenu');
        }, 80);
    } else {
        submenu.classList.remove('show-submenu');
        setTimeout(function () {
            submenu.classList.add('d-none');
        }, 80);
    }
}

async function getNames(path = "auth/users/") {
    try {
        const response = await fetch(BASE_URL + path);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // API-Daten als JSON parsen
        const data = await response.json();

        // Prüfen, ob die API ein Array zurückgibt
        if (Array.isArray(data)) {
            // Hier wird das Array zurückgegeben, falls du es so nutzen möchtest

            return { names: data };  // Namen in einem Objekt zurückgeben
        } else {
            throw new Error("Invalid data format: Expected an array.");
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        return null;
    }
}

async function getCategories(path = "categories/") {
    try {
        const response = await fetch(BASE_URL + path);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // API-Daten als JSON parsen
        const data = await response.json();

        // Prüfen, ob die API ein Array zurückgibt
        if (Array.isArray(data)) {
            // Hier wird das Array zurückgegeben, falls du es so nutzen möchtest

            return { categories: data };  // Namen in einem Objekt zurückgeben
        } else {
            throw new Error("Invalid data format: Expected an array.");
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        return null;
    }
}

async function fetchData(path = "tasks") {
    try {
        const response = await fetch(BASE_URL + path);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const tasks = await response.json();
        const usersData = await getNames();
        if (!usersData || !Array.isArray(usersData.names)) {
            throw new Error("Benutzerinformationen konnten nicht abgerufen werden.");
        }

        // Array für Tasks mit ihren zugewiesenen Benutzernamen und HTML
        const tasksWithNames = await Promise.all(tasks.map(async (task) => {
            if (Array.isArray(task.assignto)) {
                // Namen der zugewiesenen Benutzer holen
                const assignedNames = task.assignto.map(userId => {
                    const user = usersData.names.find(u => u.id === userId);
                    return user ? `${user.first_name} ${user.last_name}` : null;
                }).filter(name => name !== null);

                // HTML für die zugewiesenen Namen generieren (wird korrekt gewartet)
                const assignedNamesHTML = await generateHTMLForTask(task.id, assignedNames);

                // Task mit den zugewiesenen Namen und HTML zurückgeben
                return {
                    ...task,
                    assignedNames,
                    assignedNamesHTML
                };
            }
            return task;
        }));

        return tasksWithNames; // Tasks mit hinzugefügten assignedNames und assignedNamesHTML
    } catch (error) {
        console.error("Fehler beim Abrufen der Tasks:", error);
        return [];
    }
}
