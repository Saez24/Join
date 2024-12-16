let assignedTo = [];

/**
 * Loads names and categories for adding a new task asynchronously when the page loads.
 */
async function editAddTaskLoadNames() {
    try {
        const taskid = getCurrentTaskId()
        const [data, categories, task] = await Promise.all([
            getNames(),
            getCategories(),
            fetchTaskData(taskid),
        ]);
        if (data && data.names && categories && categories.categories) {
            const sortedKeys = data.names.map(n => n.id).sort();
            editRenderAddTaskNames(sortedKeys, data.names, task.assignto);
            editRenderAddTaskCategories(categories.categories);
            const assignedNames = getAssignedToNames(data.names);
            const currentTask = renderCurrentTask(task.assignto)
            const assignedNamesToCheckbox = editLoadSelectedAssignTo(task.assignto)
            renderEditAssignTo(assignedNames, currentTask);

        } else {
            console.error("Missing names or categories data in the response.");
        }
    } catch (error) {
        console.error("Error fetching data:", error);
    }
};

function renderCurrentTask(task) {
    return task
}


function getAssignedToNames(names) {
    if (Array.isArray(names)) {
        return names;
    } else {
        console.error("Names data is missing or invalid", names);
        return [];
    }
}

/**
 * Renders the edit-selectedAssignTo container with buttons representing the assigned names.
 * @param {Object} task - The task object containing assigned names.
 */
function renderEditAssignTo(names, sortedKeys) {
    let assignToContainer = document.getElementById('edit-selectedAssignTo');
    assignToContainer.innerHTML = ''; // Vorherigen Inhalt löschen

    let count = 0;
    let position = 0;

    // Prüfen, ob `names` ein Array ist
    if (Array.isArray(names)) {
        for (let key of sortedKeys) {
            let nameObj = names.find(n => n.id === key);

            if (nameObj) {
                let firstInitial = nameObj.first_name.charAt(0).toUpperCase();
                let lastInitial = nameObj.last_name.charAt(0).toUpperCase();
                let fullName = `${nameObj.first_name} ${nameObj.last_name}`;
                let randomColor = "#" + Math.floor(Math.random() * 16777215).toString(16);
                let button = document.createElement('button');
                button.name = fullName;
                button.classList.add('shortname');
                button.style.backgroundColor = randomColor;
                button.innerHTML = `<span>${firstInitial}${lastInitial}</span>`;
                assignToContainer.appendChild(button);
                count++;
            }
        };

        // Überlauf-Button anzeigen, falls mehr als 3 Namen vorhanden sind
        if (count > 3) {
            let moreButton = editAddMoreButton(count - 3, position);
            assignToContainer.appendChild(moreButton);
        }
    } else {
        console.warn("Namen ist kein Array:", names);
    }

    // Container sichtbar machen, falls Namen vorhanden sind
    assignToContainer.style.display = count > 0 ? 'inline-block' : 'none';
}

/**
 * Generates HTML for displaying a name with a color-coded short name and a checkbox.
 * @param {string} nameKey - The key of the name.
 * @param {string} name - The name.
 * @param {string} firstInitial - The first initial of the first name.
 * @param {string} lastInitial - The first initial of the last name.
 * @param {number} id - The ID for the HTML element.
 * @returns {string} The generated HTML.
 */
function editGenerateNameHTML(nameKey, name, firstInitial, lastInitial, assignedTo) {
    let randomColor = "#" + Math.floor(Math.random() * 16777215).toString(16);
    let isChecked = assignedTo.includes(nameKey) ? "checked" : "";

    return /*html*/ `
        <div class="dropdown_selection ${isChecked ? "selected_dropdown" : ""}" 
            data-namekey='${JSON.stringify(nameKey)}' 
            onclick="editDropdownSelectAssignTo(this)">
            
            <button class="shortname" style="background-color: ${randomColor};">
                <span>${firstInitial}${lastInitial}</span>
            </button>
            <span id="editassignname_${nameKey}">${name}</span>
            <input class="checkbox" name="assignto" value="${name}" type="checkbox" 
                id="editassignedto_${nameKey}" 
                data-initials="${firstInitial}${lastInitial}" 
                data-color="${randomColor}" ${isChecked} 
                onchange="editLoadSelectedAssignTo()">
        </div>
    `;
}


function handleCheckboxChange(checkbox) {
    const dropdownSelection = checkbox.closest('.dropdown_selection');

    if (checkbox.checked) {
        dropdownSelection.classList.remove('dropdown_selection');
        dropdownSelection.classList.add('selected_dropdown');
    } else {
        dropdownSelection.classList.remove('selected_dropdown');
        dropdownSelection.classList.add('dropdown_selection');
    }
}

/**
 * Generates the HTML for names, including initials.
 * @param {Array} sortedKeys - The sorted array of name keys.
 * @param {Object} names - The object containing the names.
 * @returns {string} The generated HTML for the names.
 */
function editRenderNamesHTML(sortedKeys, names, assignedTo) {
    let namesHTML = '';

    if (Array.isArray(names)) {
        for (let key of sortedKeys) {
            let nameObj = names.find(n => n.id === key);
            if (nameObj) {
                let firstInitial = nameObj.first_name.charAt(0).toUpperCase();
                let lastInitial = nameObj.last_name.charAt(0).toUpperCase();
                let fullName = `${nameObj.first_name} ${nameObj.last_name}`;

                namesHTML += editGenerateNameHTML(key, fullName, firstInitial, lastInitial, assignedTo);
            }
        }
    } else {
        console.warn("Namen ist kein Array:", names);
    }

    return namesHTML;
}


/**
 * Renders names HTML to the DOM.
 * @param {string} namesHTML - The HTML representing names to be rendered.
 */
function editRenderNamesToDOM(namesHTML) {
    let namesContainer = document.getElementById("edit-assignedto");
    namesContainer.innerHTML = namesHTML;

    fetchEditTask(getCurrentTaskId());
}

/**
 * Renders names for adding a new task to the DOM.
 * @param {Array} sortedKeys - The sorted array of name keys.
 * @param {Object} names - An object containing names.
 */
function editRenderAddTaskNames(sortedKeys, names, assignedTo) {
    let namesHTML = editRenderNamesHTML(sortedKeys, names, assignedTo);
    editRenderNamesToDOM(namesHTML);
}


/**
 * Toggles the visibility of the assign-to selection container.
 * If the container is currently visible, hides it; otherwise, shows it.
 */
function editSelectAssignTo() {

    let assignToContainer = document.getElementById('edit-assignedto');
    let assignToInput = document.getElementById('edit-assignedtoinput');
    if (assignToContainer.style.display === 'block') {
        assignToContainer.style.display = 'none';
        assignToInput.style.backgroundImage = 'url(./assets/img/arrow_drop.png)';
    } else {
        assignToContainer.style.display = 'block';
        assignToInput.style.backgroundImage = 'url(./assets/img/arrow_drop_down.png)';
    }
};

/**
 * Closes the assignto dropdown menu if it is currently open.
 */
function editCloseAssignTo() {
    let assignToContainer = document.getElementById('edit-assignedto');
    let assignToInput = document.getElementById('edit-assignedtoinput');
    if (assignToContainer.style.display === 'block') {
        assignToContainer.style.display = 'none';
    }
    assignToInput.style.backgroundImage = 'url(./assets/img/arrow_drop.png)';
};


function editLoadSelectedAssignTo() {
    let selectedAssignToDiv = document.getElementById("edit-selectedAssignTo");
    let checkboxes = document.querySelectorAll("#edit-assignedto .checkbox");
    let buttonContainer = document.getElementById("edit-selectedAssignTo")

    selectedAssignToDiv.innerHTML = '';
    let position = 0;
    let count = 0;

    checkboxes.forEach((checkbox, index) => {
        if (checkbox.checked) {
            count++;
            if (count <= 3) {
                let button = editCreateButton(checkbox, position);
                selectedAssignToDiv.appendChild(button);
                position += 12;
                buttonContainer.style.display = 'inline-block'
            }
        }
    });

    if (count > 3) {
        let moreButton = editAddMoreButton(count - 3, position);
        selectedAssignToDiv.appendChild(moreButton);
    }
    if (count === 0) {
        buttonContainer.style.display = 'none'
    }
};

/**
 * Diese Funktion wird beim Klick auf die Checkbox oder den Dropdown-Button ausgeführt
 * und aktualisiert das `assignedTo`-Array und die Anzeige.
 */
function editDropdownSelectAssignTo(element) {
    element.classList.toggle("selected_dropdown");

    // Checkbox-Status umschalten
    let checkbox = element.querySelector(".checkbox");
    let nameKey = JSON.parse(element.dataset.namekey);

    if (checkbox) {
        checkbox.checked = !checkbox.checked;

        // `assignedTo` aktualisieren: Hinzufügen oder Entfernen
        if (checkbox.checked) {
            if (!assignedTo.includes(nameKey)) {
                assignedTo.push(nameKey);  // Hinzufügen
            }
        } else {
            assignedTo = assignedTo.filter(key => key !== nameKey);  // Entfernen
        }

        // Die UI mit der neuen Liste der zugewiesenen Namen aktualisieren
        editLoadSelectedAssignTo(assignedTo);
    }
}

/**
 * Erzeugt einen Button für eine ausgewählte Checkbox.
 */
function editCreateButton(checkbox, position) {
    let initials = checkbox.getAttribute("data-initials");
    let color = checkbox.getAttribute("data-color");
    let checkboxId = checkbox.id;
    let button = document.createElement("button");
    button.className = "selectedAssignTo";
    button.id = `edit-selected_${checkboxId}`;
    button.style.backgroundColor = color;
    button.style.left = `${position}px`;
    button.innerText = initials;
    return button;
}


/**
 * Retrieves assigned users based on checkbox selection.
 * @returns {string[]} An array of assigned users.
 */
function editGetAssignedTo() {
    let assignedToCheckboxes = document.querySelectorAll('input[type="checkbox"][id^="editassignedto_"]:checked');
    let assignedTo = [];

    assignedToCheckboxes.forEach((checkbox) => {
        let idParts = checkbox.id.split('_').slice(1);  // Entfernt "editassignedto_"

        // Konvertiere den ersten Teil in eine Zahl und speichere ihn
        let numericId = isNaN(idParts[0]) ? idParts[0] : Number(idParts[0]);
        assignedTo.push(numericId);
    });

    return assignedTo;
}


/**
 * Adds a "more" button indicating the number of additional selected checkboxes.
 * @param {number} count - The total number of selected checkboxes.
 * @param {number} position - The left position of the "more" button.
 */
function editAddMoreButton(count, position) {
    let moreButton = document.createElement("button");
    moreButton.className = "moreButton";
    moreButton.style.left = `${position}px`;
    moreButton.innerText = `+${count}`;
    return moreButton;
};

/**
 * Renders categories for adding a new task to the DOM.
 * @param {Object} categories - An object containing categories.
 */
function editRenderAddTaskCategories(categories) {
    let categoryContainer = document.getElementById("edit-taskcategory");
    categoryContainer.innerHTML = '';

    for (let categoryKey in categories) {
        if (categories.hasOwnProperty(categoryKey)) {
            let category = categories[categoryKey];
            let categoryId = categoryKey;
            categoryContainer.innerHTML += /*html*/ `
            <div class="dropdown_selection" onclick="editDropdownSelectCategory(this)">
                <label class="label" id="${categoryId}">${category.name}
                <input class="checkbox" type="checkbox" id="edit-category_${categoryId}"></label>
            </div>
            `;
        }
    }
};

/**
 * Toggles the "selected_dropdown" class on the given element and toggles the associated checkbox state.
 * Ensures that only one checkbox within the "taskcategory" container can be selected at a time.
 * If the element is within the "taskcategory" container, it updates the checkbox state and loads the selected category into the input field.
 * 
 * @param {HTMLElement} element - The dropdown element that was clicked.
 */
function editDropdownSelectCategory(element) {
    if (element.closest("#edit-taskcategory")) {
        let categoryContainer = document.getElementById("edit-taskcategory");
        let checkboxes = categoryContainer.querySelectorAll(".checkbox");
        let clickedCheckbox = element.querySelector(".checkbox");
        let isChecked = clickedCheckbox.checked;

        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
            checkbox.closest(".dropdown_selection").classList.remove("selected_dropdown");
            editCloseSelectCategory();
        });

        clickedCheckbox.checked = !isChecked;
        if (clickedCheckbox.checked) {
            element.classList.add("selected_dropdown");
        } else {
            element.classList.remove("selected_dropdown");
        }

        editLoadToCategoryInput();
    }
};

/**
 * Loads the selected category into the category input field.
 * This function finds the checked checkbox in the taskcategory container and updates
 * the taskcategory input field with the corresponding category label.
 */
function editLoadToCategoryInput() {
    let categoryContainer = document.getElementById("edit-taskcategory");
    let categoryInput = document.getElementById("edit-taskcategoryinput");
    let checkboxes = categoryContainer.querySelectorAll(".checkbox");

    categoryInput.value = '';

    for (let checkbox of checkboxes) {
        if (checkbox.checked) {
            let labelElement = checkbox.closest(".dropdown_selection").querySelector(".label");
            if (labelElement) {
                categoryInput.value = labelElement.innerText;
            }
            break;
        }
    }
};

/**
 * Toggles the visibility of the category selection container.
 * If the container is currently visible, hides it; otherwise, shows it.
 */
function editSelectCategory() {
    let categoryContainer = document.getElementById('edit-taskcategory');
    let taskcategoryInput = document.getElementById('edit-taskcategoryinput');
    if (categoryContainer.style.display === 'block') {
        categoryContainer.style.display = 'none';
        taskcategoryInput.style.backgroundImage = 'url(./assets/img/arrow_drop.png)';
    } else {
        categoryContainer.style.display = 'block';
        taskcategoryInput.style.backgroundImage = 'url(./assets/img/arrow_drop_down.png)';
    }
};

/**
 * Closes the category dropdown menu if it is currently open.
 */
function editCloseSelectCategory() {
    let categoryContainer = document.getElementById('edit-taskcategory');
    let taskcategoryInput = document.getElementById('edit-taskcategoryinput');
    if (categoryContainer.style.display === 'block') {
        categoryContainer.style.display = 'none';
    }
    taskcategoryInput.style.backgroundImage = 'url(./assets/img/arrow_drop.png)';
};

/**
 * Filters categories based on the entered text and updates the display.
 * @param {string} searchText - The entered text for filtering the categories.
 */
function editFilterCategories(searchText) {
    let categoryContainer = document.getElementById("edit-taskcategory");
    let categories = categoryContainer.querySelectorAll(".dropdown_selection");

    categories.forEach(category => {
        let label = category.querySelector(".label");
        let categoryName = label.innerText.toLowerCase();
        if (categoryName.includes(searchText.toLowerCase())) {
            category.style.display = "flex";
        } else {
            category.style.display = "none";
        }
    });
};

/**
 * Event handler for input in the category input field.
 */
function editHandleCategoryInput() {
    let searchInput = document.getElementById("edit-taskcategoryinput");
    let searchText = searchInput.value.trim();
    editFilterCategories(searchText);
};