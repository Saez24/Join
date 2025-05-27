/**
 * Gets the updated task data from the form inputs.
 * @returns {Object} The updated task data.
 */
function getUpdatedTaskData() {
    // let id = document.getElementById('TaskDetailsDialog').getAttribute('data-taskid');
    let title = getTitleInput();
    let description = getDescriptionInput();
    let duedate = getDueDateInput();
    let category = getCategoryInput();
    let subtasks = getSubtasks();
    let prio = getPriority();
    let assignto = editGetAssignedTo();

    return {
        title: title,
        description: description,
        duedate: duedate,
        category: category,
        prio: prio,
        subtask: subtasks,
        assignto: assignto
    };
};

/**
 * Gets the value of the title input field.
 * @returns {string} The value of the title input field.
 */
function getTitleInput() {
    return document.getElementById('edit-tasktitle').value;
};

/**
 * Gets the value of the description input field.
 * @returns {string} The value of the description input field.
 */
function getDescriptionInput() {
    return document.getElementById('edit-description').value;
};

/**
 * Gets the value of the due date input field.
 * @returns {string} The value of the due date input field.
 */
function getDueDateInput() {
    return document.getElementById('edit-duedate').value;
};

/**
 * Gets the value of the category input field.
 * @returns {string} The value of the category input field.
 */
function getCategoryInput() {
    return document.getElementById('edit-taskcategoryinput').value;
};

/**
 * Collects subtasks from the DOM.
 * @returns {Array<Object>} The list of subtasks.
 */
function getSubtasks() {
    // Hier nehmen wir an, dass du die Subtasks mit dem completed Status aus der getSubtasksData Funktion verwendest
    let subtasks = [...document.querySelectorAll('#edit-addsubtasks .edit-subtask-title')].map(span => ({
        name: span.innerText,
        completed: span.getAttribute('data-completed') === 'true' // Hier setzen wir voraus, dass der completed Status in einem Attribut gespeichert ist
    }));

    return subtasks;
};

async function getSubtasksData(taskid) {
    try {
        let response = await fetch(`${BASE_URL}tasks/${taskid}/`);
        let taskObject = await response.json();

        // Nur die Subtasks mit name und completed Status extrahieren
        if (taskObject.subtask && Array.isArray(taskObject.subtask)) {
            let subtasksWithStatus = taskObject.subtask.map(subtask => ({
                name: subtask.name,
                completed: subtask.completed // Falls completed vorhanden ist
            }));
            return subtasksWithStatus;
        } else {
            return [];
        }
    } catch (error) {
        console.error('Fehler beim Abrufen der Subtasks:', error);
        return [];
    }
}

/**
 * Determines the priority based on the active button.
 * @returns {string|null} The priority value.
 */
function getPriority() {
    if (activeButton) {
        switch (activeButton.id) {
            case 'edit-urgent':
                return 'urgent';
            case 'edit-medium':
                return 'medium';
            case 'edit-low':
                return 'low';
            default:
                return null;
        }
    }
    return null;
};

/**
 * Saves the updated task data.
 * @param {string} taskid - The ID of the task to update.
 */
async function saveUpdatedTask(taskid) {
    // Abrufen der Subtasks mit name und completed Status
    let subtasksData = await getSubtasksData(taskid);
    let updatedData = getUpdatedTaskData();

    // Die Subtasks-Daten mit dem erhaltenen completed Status kombinieren
    updatedData.subtask = updatedData.subtask.map((subtask, index) => ({
        ...subtask,
        completed: subtasksData[index]?.completed // Wenn subtasksData verfügbar ist, den Status beibehalten
    }));

    if (!editValidateTaskInputField(updatedData)) {
        return;
    }

    if (!editValidateTaskDetails(updatedData)) {
        return;
    }

    await updateTask(taskid, updatedData);

    displayTasks();
    closeDialogEdit();
};

async function updateTask(taskid, updatedData) {
    try {
        let response = await fetch(`${BASE_URL}tasks/${taskid}/`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return response.json();
    } catch (error) {
        console.error("Error updating data:", error);
    }
};

async function handleSaveButtonClicked() {
    let taskid = getCurrentTaskId(); // Hier taskid holen, möglicherweise async
    if (!taskid) {
        console.error('Keine gültige Task-ID gefunden.');
        alert('Fehler: Keine gültige Task-ID gefunden.');
        return;
    }
    await saveUpdatedTask(taskid); // Hier saveUpdatedTask mit taskid aufrufen


};

async function deleteTask() {
    try {
        let taskid = getCurrentTaskId();
        let response = await fetch(`${BASE_URL}tasks/${taskid}/`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ deleted: true })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Nur parsen, wenn es einen Inhalt gibt
        if (response.headers.get("content-length") > 0) {
            let data = await response.json();
        }

        hidePopup();
        displayTasks();
    } catch (error) {
        console.error("Error deleting task:", error);
    }
};
