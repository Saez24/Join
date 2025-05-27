/**
 * Generates a random color excluding white.
 * 
 * @function generateRandomColor
 * @returns {string} A random color in hexadecimal format.
 */
function generateRandomColor() {
    let randomColor;
    do {
        randomColor = "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    } while (randomColor.toUpperCase() === '#FFFFFF');
    return randomColor;
};

async function generateHTMLForTask(taskId, assignedNames) {
    return generateAssignedNamesHTML(taskId, assignedNames);
}

/**
 * Generates HTML for assigned names with a 'Plus' button for overflow.
 * 
 * @function generateAssignedNamesHTML
 * @param {string[]} assignedNames - An array of names assigned to a task.
 * @returns {string} HTML string representing the assigned names.
 */
function generateAssignedNamesHTML(taskId, assignedNames) {
    if (!Array.isArray(assignedNames) || assignedNames.length === 0) {
        console.warn(`assignedNames ist ungültig für Task ${taskId}:`, assignedNames);
        return '';
    }

    let MAX_NAMES_DISPLAYED = 3;
    let html = '';

    // Initialen-Generierung
    assignedNames.slice(0, MAX_NAMES_DISPLAYED).forEach(name => {
        const initials = name.split(' ').map(n => n[0]).join('');
        const randomColor = generateRandomColor();

        html += /*html*/`
        <div class="assignedName" style="background-color: ${randomColor};">
            <span>${initials}</span>
        </div>`;
    });

    // Überlauf-Logik
    const overflowCount = Math.max(0, assignedNames.length - MAX_NAMES_DISPLAYED);

    if (overflowCount > 0) {
        html += /*html*/`
        <div class="moreButtonBoard">+${overflowCount}</div>`;
    }

    return html;
}

/**
 * Generates HTML content for displaying subtask count and progress bar.
 * @param {Array} subtasks - The array of subtasks.
 * @param {boolean} isChecked - The state of the checkbox.
 * @param {string} taskId - The ID of the task.
 * @returns {string} HTML content for subtask count and progress bar.
 */
function generateSubtaskCountHTML(subtasks, isChecked, taskId) {
    let totalSubtasks = subtasks ? subtasks.length : 0;
    let completedSubtasks = subtasks ? subtasks.filter(subtask => subtask.completed).length : 0;
    let progressPercentage = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;
    let progressBarStyle = `width: ${progressPercentage}%;`;
    let count = `${completedSubtasks}/${totalSubtasks} Subtask${totalSubtasks !== 1 ? 's' : ''}`;

    if (totalSubtasks > 0 || isChecked) {
        let progressBarHTML = `<progress value="${progressPercentage}" max="100"></progress>`;
        return `<div id="subtaskProgress_${taskId}" class="subtaskProgress">${progressBarHTML}<p class="subtaskCount">${count}</p></div>`;
    } else {
        return '';
    }
};

/**
 * Creates a task element.
 * 
 * @function createTaskElement
 * @param {Object} task - The task object.
 * @returns {string} HTML string representing the task element.
 */
async function createTaskElement(task, search) {
    // await getNamesAndInitialsData();
    const { assignedNames, assignedNamesHTML } = task; // Direkt von der fetchData übergeben
    let taskid = task.id; // Verwende die Task-ID
    let subtaskCountHTML = generateSubtaskCountHTML(task.subtask || [], false, taskid); // Task-ID übergeben
    let priorityImage = buttonImages[task.prio] || './assets/img/prio_media.png';
    let categoryColor = CategoryColors[task.category] || { background: '#000000', color: '#FFFFFF' };
    let descriptionSection = task.description ? `<p class="descriptionBox">${task.description}</p>` : '';

    // Task-Element nur erstellen, wenn alle Daten verfügbar sind
    if (shouldCreateTaskElement(task, assignedNames, search)) {
        setTimeout(checkEmptyTaskContainers, 0);
        return createTaskHTML(task, taskid, assignedNames, assignedNamesHTML, subtaskCountHTML, priorityImage, categoryColor, descriptionSection);
    }
    setTimeout(checkEmptyTaskContainers, 0);
    return '';
}


/**
 * Creates the HTML string for a task element.
 * 
 * @param {Object} task - The task object containing details like title and category.
 * @param {string} taskid - The unique ID of the task element.
 * @param {string} assignedNamesHTML - HTML string representing assigned names.
 * @param {string} subtaskCountHTML - HTML string representing subtask count and progress.
 * @param {string} priorityImage - URL of the priority image associated with the task.
 * @param {Object} categoryColor - Object containing background and text color for the category button.
 * @param {string} descriptionSection - Optional HTML string for the task description.
 * @returns {string} HTML string representing the task element.
 */
function createTaskHTML(task, taskid, assignedNames, assignedNamesHTML, subtaskCountHTML, priorityImage, categoryColor, descriptionSection) {
    return /*html*/`
        <div id="${taskid}" draggable="true" ondragstart="startDragging('${taskid}')" class="toDoBox" onclick="showPopup('${taskid}')">
            <div class="taskHeader">
                <button class="CategoryBox" style="background-color: ${categoryColor.background};">${task.category}</button>
                    <div class="arrowContainer">
                        <svg id="ArrowDrop" class="arrow" onclick="moveTaskUp(event)" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M7 14l5-5 5 5z"/>
                        </svg>
                        <svg id="ArrowDropDown" class="arrow" onclick="moveTaskDown(event)" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M7 10l5 5 5-5z"/>
                        </svg>
                    </div>
            </div>
            <p class="HeadlineBox">${task.title}</p>
            ${descriptionSection}
            ${subtaskCountHTML} <!-- Insert subtask count HTML here -->
            <div class="nameSection">
                ${assignedNamesHTML}
                <div class="prioImgContainer">
                    <img class="prioImg" src="${priorityImage}" alt="Priority">
                </div>
            </div>
        </div>
    `;
};

/**
 * Categorizes tasks into their respective status categories.
 * 
 * @function categorizeTasks
 * @param {Object[]} tasks - An array of task objects.
 * @returns {Object} An object containing categorized tasks as HTML strings.
 */
async function categorizeTasks(tasks, search) {
    let categorizedTasks = {
        todo: '',
        inprogress: '',
        awaitfeedback: '',
        done: ''
    };

    for (const task of tasks) {
        let taskHTML = await createTaskElement(task, search);
        switch (task.status) {
            case 'todo':
                categorizedTasks.todo += taskHTML;
                break;
            case 'inprogress':
                categorizedTasks.inprogress += taskHTML;
                break;
            case 'awaitfeedback':
                categorizedTasks.awaitfeedback += taskHTML;
                break;
            case 'done':
                categorizedTasks.done += taskHTML;
                break;
            default:
                console.warn(`Unknown task status: ${task.status}`);
        }
    }

    return categorizedTasks;
}


/**
 * Inserts categorized tasks into the DOM.
 * 
 * @function insertTasksIntoDOM
 * @param {Object} categorizedTasks - An object containing categorized tasks as HTML strings.
 */
function insertTasksIntoDOM(categorizedTasks) {
    document.querySelector('#todo .tasks').innerHTML = categorizedTasks.todo;
    document.querySelector('#inprogress .tasks').innerHTML = categorizedTasks.inprogress;
    document.querySelector('#awaitfeedback .tasks').innerHTML = categorizedTasks.awaitfeedback;
    document.querySelector('#done .tasks').innerHTML = categorizedTasks.done;
    document.getElementById('todo').classList.remove('drag-area-highlight');
    document.getElementById('inprogress').classList.remove('drag-area-highlight');
    document.getElementById('awaitfeedback').classList.remove('drag-area-highlight');
    document.getElementById('done').classList.remove('drag-area-highlight');
};

/**
 * Fetches tasks, categorizes them, and inserts them into the DOM.
 * 
 * @async
 * @function displayTasks
 */
async function displayTasks(search) {
    try {
        let tasks = await fetchData();
        let categorizedTasks = await categorizeTasks(tasks, search);
        insertTasksIntoDOM(categorizedTasks, search);
    } catch (error) {
        console.error('Error fetching and displaying tasks:', error);
    }
};

/**
 * Finds the selected task from the provided tasks based on its ID.
 * @param {Array} tasks - An array of tasks.
 * @param {string} taskid - The ID of the task to find.
 * @returns {Object|null} The selected task if found, otherwise null.
 */
function findSelectedTask(tasks, taskid) {
    return tasks.find(item => item.id === taskid);
};

/**
 * Extracts and returns the relevant task data from the selected task object.
 * @param {Object} selectedTask - The selected task object.
 * @returns {Object} Extracted task data.
 */
function extractTaskData(selectedTask) {
    const { assignto = [], subtask = [], prio, category, description, title, duedate } = selectedTask;
    const taskId = selectedTask.id;

    return { assignto, subtask, prio, category, description, title, duedate, taskId };
};


async function generateHTMLForTaskDetails(taskId, assignedNames, assignto) {
    return generateAssignedNamesHTMLDetails(taskId, assignedNames, assignto);
}


function generateAssignedNamesHTMLDetails(taskId, assignedNames, assignto) {
    if (!Array.isArray(assignedNames) || assignedNames.length === 0) {
        console.warn(`assignedNames ist ungültig für Task ${taskId}:`, assignedNames);
        return '';
    }

    // Stelle sicher, dass assignto ein Array ist
    if (!Array.isArray(assignto)) {
        console.error(`assignto für Task ${taskId} ist ungültig:`, assignto);
        return '';
    }

    let assignedNamesHTML = '';

    assignto.forEach(id => {
        // Finde die Person mit der entsprechenden ID
        const person = assignedNames.find(p => p.id === id);

        if (!person) {
            console.error(`Keine Person gefunden für ID ${id} bei Task ${taskId}`);
            return;
        }

        const { first_name, last_name } = person;
        const initials = `${first_name[0].toUpperCase()}${last_name[0].toUpperCase()}`;
        const randomColor = generateRandomColor();

        assignedNamesHTML += /*html*/`
        <div class="assignedtoDialogInitials">
            <p class="assignedName" style="background-color: ${randomColor};">${initials}</p>
            <p>${first_name} ${last_name}</p>
        </div>`;
    });

    return assignedNamesHTML;  // Rückgabe des HTML-Strings
}


/**
 * Generates HTML content for the task details.
 * @param {Array} names - Die Liste der Personen mit ihren Daten.
 * @param {Array} subtasks - Die Liste der Subtasks.
 * @param {string} taskId - Die ID der Aufgabe.
 * @returns {Object} HTML-Inhalt für die Aufgabendetails.
 */
function generateHTMLContent(assignto, subtasks, taskId, names) {

    const subtaskHTML = subtasks.map((subtask, index) => `
        <div class="subtaskItem">
            <input id="subtask-${index}" type="checkbox" ${subtask.completed ? 'checked' : ''} 
                   onchange="updateSubtaskStatus('${taskId}', ${index}, this.checked)">
            <p>${subtask.name}</p>
        </div>
    `).join('');

    // Rückgabe des HTML-Inhalts
    return { subtaskHTML };
}

async function updateSubtaskStatus(taskId, index, isChecked) {
    try {
        // Abrufen der aktuellen Task-Daten
        let response = await fetch(`${BASE_URL}tasks/${taskId}/`);
        let taskObject = await response.json();

        // Prüfen, ob die Subtask existiert
        if (taskObject?.subtask && taskObject.subtask[index]) {
            // Wert umschalten
            taskObject.subtask[index].completed = isChecked;

            // Task-Daten aktualisieren
            await fetch(`${BASE_URL}tasks/${taskId}/`, {
                method: 'PUT',
                body: JSON.stringify(taskObject),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            // Fortschrittsanzeige aktualisieren
            const progressBarContainer = document.getElementById(`subtaskProgress_${taskId}`);
            if (progressBarContainer) {
                progressBarContainer.innerHTML = generateSubtaskCountHTML(taskObject.subtask, taskId);
            }

        } else {
            console.error(`Subtask mit Index ${index} nicht gefunden für Task ${taskId}`);
        }
    } catch (error) {
        console.error('Fehler beim Aktualisieren des Task-Status:', error);
    }
};


/**
 * Processes the details of the selected task.
 * @param {Object} selectedTask - The selected task object.
 * @returns {Object} Processed task details.
 */
async function processTaskDetails(selectedTask, names) {
    const taskData = extractTaskData(selectedTask);
    const htmlContent = generateHTMLContent(taskData.assignto, taskData.subtask, taskData.taskId, names);
    const assignedNamesHTMLSeparated = await generateHTMLForTaskDetails(taskData.taskId, names, taskData.assignto);

    return formatTaskDetails(taskData, htmlContent, assignedNamesHTMLSeparated);
};

/**
 * Generates a random color excluding white.
 * 
 * @function generateRandomColor
 * @returns {string} A random color in hexadecimal format.
 */
function generateRandomColor() {
    let randomColor;
    do {
        randomColor = "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    } while (randomColor.toUpperCase() === '#FFFFFF');
    return randomColor;
};

/**
 * Formats the task details including dates and category colors.
 * @param {Object} taskData - The extracted task data.
 * @param {Object} htmlContent - The generated HTML content.
 * @returns {Object} Formatted task details.
 */
function formatTaskDetails(taskData, htmlContent, assignedNamesHTMLSeparated) {
    const { prio, category, description, title, duedate } = taskData;
    const priorityImage = buttonImages[prio] || './assets/img/prio_media.png';
    const categoryColor = CategoryColors[category] || { background: '#000000', color: '#FFFFFF' };
    const dueDateObj = new Date(duedate);
    const formattedDueDate = dueDateObj.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });

    return {
        category,
        categoryColor,
        title,
        description,
        formattedDueDate,
        prio,
        priorityImage,
        ...htmlContent,
        assignedNamesHTMLSeparated
    };
};

function searchTask() {
    let search = document.getElementById('search').value || '';
    search = search.toLowerCase();

    if (search === '') {
        activeSearch = false;
        displayTasks(search);
    } else if (search.length > 3) {
        activeSearch = true;
        displayTasks(search);
    } else {
        return;
    }
};

function shouldCreateTaskElement(task, assignedNames, search) {
    if (activeSearch) {
        // Wenn aktive Suche aktiv ist, überprüfe die Suchabfrage
        return checkSearchInput(task, assignedNames, search);
    }

    // Wenn keine Suche aktiv ist, sicherstellen, dass die assignedNamesHTML nicht leer ist
    return assignedNames && assignedNames.length > 0;
}


function checkSearchInput(task, assignedNames, search) {
    const searchLower = (search ?? '').toLowerCase().trim();
    if (!searchLower) return false;

    return (
        (Array.isArray(assignedNames)
            ? assignedNames.some(name => name.toLowerCase().includes(searchLower))
            : typeof assignedNames === 'string'
                ? assignedNames.toLowerCase().includes(searchLower)
                : false
        ) ||
        (task.description?.toLowerCase() ?? '').includes(searchLower) ||
        (task.title?.toLowerCase() ?? '').includes(searchLower)
    );
}



function addEmptyMessage(container, text) {
    if (container.children.length === 0) {
        let p = document.createElement('p');
        p.textContent = text;
        p.className = 'empty-text';
        container.appendChild(p);
    }
};

function checkEmptyTaskContainers() {
    let container1 = document.getElementById('to-do-tasks-container');
    let container2 = document.getElementById('in-progress-tasks-container');
    let container3 = document.getElementById('await-feedback-tasks-container');
    let container4 = document.getElementById('done-tasks-container');

    addEmptyMessage(container1, 'No tasks To do');
    addEmptyMessage(container2, 'No tasks In progress');
    addEmptyMessage(container3, 'No tasks Await feedback');
    addEmptyMessage(container4, 'No tasks Done');
};