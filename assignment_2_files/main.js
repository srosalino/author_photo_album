/* Retrieving important HTML elements to be used thoughout the tasks */

var mainTable = document.getElementById("mainTable");       /* Retrieving the table element used to represent the photo album */
var mainTableTbody = document.querySelector("#mainTable > tbody")  /* Retrieving the above table's table body to store all the author's data */
var filterOption = document.getElementById("authorToDisplay");    /* Retrieving the drop-down list from the HTML */



/* Important functions to be used throughout the tasks */


/* Function to insert a new author row into the table */
function insertNewAuthor(id, image, name, alt, tags, description) {

    var position = mainTableTbody.children.length;    /* Gets the position in the table for the row to be inserted */

    var row = mainTableTbody.insertRow(position);  /* Creating an empty row just before the form dedicated modal */

    var imageCell = row.insertCell(0);             /* Creating empty cells to receive all the respective data in the future */
    var authorCell = row.insertCell(1);
    var altCell = row.insertCell(2);
    var tagsCell = row.insertCell(3);
    var descriptionCell = row.insertCell(4);
    var idCell = row.insertCell(5);

    var anchor = document.createElement("a");   /* Creating a new anchor tag to be used on the submitted image's cell */
    imageCell.appendChild(anchor);
    anchor.target = "_blank";

    var img = document.createElement("img");    /* Creating a new image tag to properly present the submitted image */
    imageCell.appendChild(img);
    img.src = image;
    img.alt = alt;
    img.id = id;

    authorCell.innerHTML = name;                /* Insert the appropriate author's data into the HTML */
    altCell.innerHTML = alt;
    tagsCell.innerHTML = tags;
    descriptionCell.innerHTML = description;
    idCell.innerHTML = id

    var newOption = document.createElement("option");      /* Creating a new option in the drop-down filter list for the just added author */
    filterOption.appendChild(newOption);
    newOption.value = name;
    newOption.innerText = name;
}


/* Function to send an AJAX GET request to retrieve all the author's data and then inserting them into the photo album */
function getDataToTable() {
    fetch("http://localhost:3000/", {     /* GET request using AJAX (fetch) */
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then((response) => response.json())
        .then((data) => {
            var authorsToBeInserted = data;     /* Assigning the fetched data to a javascript variable */
            var insertedNames = [];             /* Creating a list containing all the added author's names */

            for (let author of authorsToBeInserted) {   /* Iterating through the list */

                var authorNameToBeInserted = author.author;

                if (insertedNames.indexOf(authorNameToBeInserted) == -1) {  /* If the author's name is already on the list they won't be added, */
                    var idToBeInserted = author.id;                         /* if it isn't the adding process begins */
                    var imageToBeInserted = author.image;
                    var altToBeInserted = author.alt;
                    var tagsToBeInserted = author.tags;
                    var descriptionToBeInserted = author.description;
                    insertNewAuthor(idToBeInserted, imageToBeInserted, authorNameToBeInserted, altToBeInserted, tagsToBeInserted, descriptionToBeInserted);
                    insertedNames.push(authorNameToBeInserted);     /* Appending the added author's name into the list, to avoid duplicates */
                }
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}


/* Function to automatically fill all the data fields on the update process as soon as the user types an ID to update, so that the process
of updating any information is made easier */
function fillAuthorToUpdate(id) {
    fetch("http://localhost:3000/", {     /* GET request using AJAX (fetch) */
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then((response) => response.json())
        .then((authorsData) => {
            var authorExists = false;   /* Flag variable to be used in the end of the function */

            for (let author of authorsData) {   /* Iterating through the list */

                var currentAuthorId = author.id;

                if (currentAuthorId == id) {    /* If the currently iterated author id matches the inputed id by the user 
                                                all the data will be automatically filled */

                    var imageToBeUpdated = author.image;
                    var authorToBeUpdated = author.author
                    var altToBeUpdated = author.alt;
                    var tagsToBeUpdated = author.tags;
                    var descriptionToBeUpdated = author.description;

                    document.getElementById("updateImage").value = imageToBeUpdated;
                    document.getElementById("updateAuthor").value = authorToBeUpdated;
                    document.getElementById("updateAlt").value = altToBeUpdated;
                    document.getElementById("updateTags").value = tagsToBeUpdated;
                    document.getElementById("updateDescription").value = descriptionToBeUpdated;
                    authorExists = true;
                }
            }

            if (!authorExists) {    /* If the flag variable is still false, that means that no valid ID was passed, meaning that all the update
                                    fields will comeback to empty */

                document.getElementById("updateImage").value = "";
                document.getElementById("updateAuthor").value = "";
                document.getElementById("updateAlt").value = "";
                document.getElementById("updateTags").value = "";
                document.getElementById("updateDescription").value = "";
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}



getDataToTable();   /* Command to immediately fetch the data from the API */



let submitButton = document.getElementById("submitButton");     /* Retrieving the form submit button from the HTML */

submitButton.addEventListener("click", async function (event) {    /* Adding an event listener on click actions towards the submit button */

    event.preventDefault();   /* Prevents the user from going elsewhere */

    submittedImage = document.getElementById("image").value;        /* Stores all the submitted data into dedicated variables */
    submittedAuthorName = document.getElementById("author").value;
    submittedAlt = document.getElementById("alt").value;
    submittedTags = document.getElementById("tags").value;
    submittedDescription = document.getElementById("description").value

    const submittedData = {     /* Creates a JavaScript object containing the submitted data to be sent to the database */
        'image': submittedImage,
        'author': submittedAuthorName,
        'alt': submittedAlt,
        'tags': submittedTags,
        'description': submittedDescription
    };

    fetch("http://localhost:3000/", {     /* POST request using AJAX (fetch) */
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(submittedData),    /* Converting the submitted data object into a JSON string */
    })
        .then((response) => {
            console.log(response);
            return response.json();
        }
        )
        .then((body) => {
            insertNewAuthor(body.id, submittedImage, submittedAuthorName, submittedAlt, submittedTags, submittedDescription);
            console.log("Author submitted successfully.");   /* Inserting the submitted information into a new row */
        })
        .catch((error) => {
            console.error('Error:', error);
        });
});



/* Reseting the gallery process */

let resetButton = document.getElementById("resetButton");   /* Retrieving the reset button from the HTML */

resetButton.addEventListener("click", function () {     /* Adding an event listener on click actions towards the reset button */

    var resetAddress = "http://localhost:3000/reset";    /* API database reset request */

    fetch(resetAddress, {     /*GET request using AJAX (fetch) */
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then(() => {
            var numberAuthors = mainTableTbody.children.length;   /* Retrieving the number of authors currently in the album */
            var authorRows = mainTableTbody.children;       /* Retrieving the HTML collection of author elements in the album */

            for (let i = 0; i < numberAuthors; i++) {   /* Iterating over the number of authors */
                authorRows[0].remove();                 /* We will always want to remove the author on the index 0, since the gallery will be */
                filterOption.children[1].remove();      /* dynamically updated. We will always want to remove the the author on the index 1 */
            }                                           /* on the filter top-down box, since index 0 will correspond to the show all galery 
                                                           option */
            console.log('Gallery sucessfully reseted.');

            setTimeout(() => {
                getDataToTable();       /* As soon as the gallery is reseted, the album will comeback only containing the example authors */
            }, 1000);

        })
        .catch((error) => {
            console.error('Error:', error);
        });
});



/* Modals construction */

/* Modal construction: Based on https://www.w3schools.com/howto/howto_css_modals.asp */
/* Adapted according to the webpage structure */

var authorModal = document.getElementById("authorModal");   /* Retrieving the submission modal from the HTML */
var modalOpener = document.getElementById("modalButton");   /* Retrieving the button responsible for opening the submission modal */
var modalCloser = document.getElementsByClassName("close")[0];  /* Retrieving the span tag responsible for closing the modal */

var updateAuthorModal = document.getElementById("updateAuthorModal");   /* Retrieving the update modal from the HTML */
var modalUpdateOpener = document.getElementById("modalUpdateButton");   /* Retrieving the button responsible for opening the update modal */
var modalUpdateCloser = document.getElementsByClassName("close")[1];  /* Retrieving the span tag responsible for closing the update modal */


// Submission modal
window.addEventListener("click", function (event) {   /* Adding an event to close the model if the user clicks anywhere outside of it */
    if (event.target == authorModal) {
        authorModal.style.display = "none";
    }
});


modalOpener.addEventListener("click", function (event) {    /* Adding an event to open the modal as soon as the user clicks the opening button */
    event.preventDefault();                                 /* Prevents the user from going elsewhere */
    authorModal.style.display = "block";                    /* The modal will be displayed as a block element */
});


modalCloser.addEventListener("click", function () {   /* Adding an event to close the modal as soon as the user clicks the closing button */
    authorModal.style.display = "none";               /* The modal will no longer be displayed */
});


// Update modal
window.addEventListener("click", function (event) {   /* Adding an event to close the model if the user clicks anywhere outside of it */
    if (event.target == updateAuthorModal) {
        updateAuthorModal.style.display = "none";
    }
});


modalUpdateOpener.addEventListener("click", function (event) { /* Adding an event to open the modal as soon as the user clicks the opening button */
    event.preventDefault();                                    /* Prevents the user from going elsewhere */
    updateAuthorModal.style.display = "block";                 /* The modal will be displayed as a block element */
});


modalUpdateCloser.addEventListener("click", function () {   /* Adding an event to close the modal as soon as the user clicks the closing button */
    updateAuthorModal.style.display = "none";               /* The modal will no longer be displayed */
});



document.getElementById("updateButton").addEventListener("click", function (event) {    /* Creating an event listener to deal with the update
                                                                                        /* process, as soon as the user clicks the update button */


    const updatingData = {     /* Creating a JavaScript object of the data to be updated*/
        'image': document.getElementById("updateImage").value,
        'author': document.getElementById("updateAuthor").value,
        'alt': document.getElementById("updateAlt").value,
        'tags': document.getElementById("updateTags").value,
        'description': document.getElementById("updateDescription").value
    }


    fetch("http://localhost:3000/item/" + document.getElementById("updateId").value, {   /* PUT request using AJAX (fetch) */
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatingData),    /* Converting the updating data object into a JSON string */
    })
        .then((response) => {
            if (response.ok) {

                console.log("Author updated successfully");

                var numberAuthors = mainTableTbody.children.length;   /* Retrieving the number of authors currently in the album */
                var authorRows = mainTableTbody.children;       /* Retrieving the HTML collection of author elements in the album */

                for (let i = 0; i < numberAuthors; i++) {  /* Iterating over the number of authors */
                    authorRows[0].remove();                /* We will always want to remove the author on the index 0, since the gallery will be */
                    filterOption.children[1].remove();     /* dynamically updated. We will always want to remove the the author on the index 1 */
                }

                getDataToTable();   /* After cleaning all the album, all the data will be reloaded from the API, but now after the PUT request 
                                    has been made so that all the information is updated */

            }
        }
        )
        .catch((error) => {
            console.error('Error:', error);
        });
});



document.getElementById("deleteButton").addEventListener("click", function (event) {   /* Creating an event listener to deal with the author delete
                                                                                       /* process, as soon as the user clicks the delete button */

    var deletetId = document.getElementById("updateId").value;                         /* Variable storing the author's id to be deleted */            

    fetch("http://localhost:3000/item/" + currentId, {                                 /* DELETE request using AJAX (fetch) */
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        }
    })
        .then((response) => {

            if (response.ok) {                          /* If the response code is 200 */

                console.log("Author deleted successfully");   

                var numberAuthors = mainTableTbody.children.length;   /* Retrieving the number of authors currently in the album */
                var authorRows = mainTableTbody.children;             /* Retrieving the HTML collection of author elements in the album */

                for (let i = 0; i < numberAuthors; i++) {             /* Iterating over the number of authors */
                    var currentAuthor = authorRows[i];                /* Current author being iterated */  
                    if (currentAuthor.lastChild.innerText == deletetId) {   /* If the current author's id is the same as the one given in the */
                        authorRows[i].remove();                             /* parameter, its row will be removed from the album */
                        filterOption.children[i + 1].remove();        /* Dynamically updating the author filter drop-down menu */
                        break;                                        /* As soon as the operation is done, the for loop should terminate */
                    }
                }
            }
        }
        )
        .catch((error) => {                                           /* Otherwise, an error is thrown */
            console.error('Error:', error);
        });
});



document.getElementById("authorToDisplay").addEventListener("change", function () {  /* Adding an event listener to only display the selected
                                                                                        author by the user on the album */
    var selectedAuthorIndex = document.getElementById("authorToDisplay").selectedIndex - 1; /* The selected author index will have to be subtracted */
    var numberAuthors = mainTableTbody.children.length;                                     /* by 1, since index 0 will correspond to the show all */
    var authorRows = mainTableTbody.children;                                               /* gallery option */

    for (let i = 0; i < numberAuthors; i++) {
        if (i == selectedAuthorIndex || selectedAuthorIndex == -1) {    /* If the selected index matches the current author being iterated only */
            authorRows[i].style.display = 'table-row';                  /* their row will be made visible. If the selected index is -1 (show all */
        } else {                                                        /* gallery option) all the authors will be made visible */
            authorRows[i].style.display = 'none';
        }
    }
});


var idToUpdate = document.getElementById("updateId");   /* Retrieving the update ID field from the update modal */

idToUpdate.addEventListener('input', function () {  /* As soon as the user types an ID to perform update requests, all the fields will be */
    fillAuthorToUpdate(idToUpdate.value);           /* automatically filled by calling the above-defined function */
});
