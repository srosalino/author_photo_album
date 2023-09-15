// ###############################################################################
//
// Database setup:
// First: Our code will open a sqlite database file for you, and create one if it not exists already.
// We are going to use the variable "db' to communicate to the database:
// If you want to start with a clean sheet, delete the file 'phones.db'.
// It will be automatically re-created and filled with one example item.

const sqlite = require('sqlite3').verbose();
let db = my_database('./gallery.db');
// ###############################################################################
// The database should be OK by now. Let's setup the Web server so we can start
// defining routes.
//
// First, create an express application `app`:

var express = require("express");
var cors = require("cors");
var app = express();

// We need some middleware to parse JSON data in the body of our HTTP requests:
app.use(express.json());
app.use(cors());



// Useful functions that will come in handy throughout the tasks


// Function to delete the entire database
function deleteDb(db, res) {
	db.run(`DROP TABLE gallery`, function (err) {	// Dropping the entire database //	
		if(err) {								    // In case an error is thrown
			res.status(500);
			res.send("Server error - Could not delete the database.");
		}
	});
}


// Function to repopulate the database to only containing the example authors in the API 
function repopulateDb(db, res) {
	db.serialize(() => {
		db.run(`
        	CREATE TABLE IF NOT EXISTS gallery
        	 (
                    id INTEGER PRIMARY KEY,
                    author CHAR(100) NOT NULL,
                    alt CHAR(100) NOT NULL,
                    tags CHAR(256) NOT NULL,
                    image char(2048) NOT NULL,
                    description CHAR(1024) NOT NULL
		 )
		`);
		db.all(`select count(*) as count from gallery`, function (err, result) {
			if (result[0].count == 0) {
				db.run(`INSERT INTO gallery (author, alt, tags, image, description) VALUES (?, ?, ?, ?, ?)`, [
					"Tim Berners-Lee",
					"Image of Berners-Lee",
					"html,http,url,cern,mit",
					"https://upload.wikimedia.org/wikipedia/commons/9/9d/Sir_Tim_Berners-Lee.jpg",
					"The internet and the Web aren't the same thing."
				]);
				db.run(`INSERT INTO gallery (author, alt, tags, image, description) VALUES (?, ?, ?, ?, ?)`, [
					"Grace Hopper",
					"Image of Grace Hopper at the UNIVAC I console",
					"programming,linking,navy",
					"https://upload.wikimedia.org/wikipedia/commons/3/37/Grace_Hopper_and_UNIVAC.jpg",
					"Grace was very curious as a child; this was a lifelong trait. At the age of seven, she decided to determine how an alarm clock worked and dismantled seven alarm clocks before her mother realized what she was doing (she was then limited to one clock)."
				]);
				console.log('Inserted dummy photo entry into empty database');
			} else {
				console.log("Database already contains", result[0].count, " item(s) at startup.");
			}
			if(err) {
				res.status(500);	// In case an error is thrown //
				res.send("Server error - Could not repopulate the database.");
			}
		});
	});
}


// Function to reset the database to its original state
function resetDb(db, res) {

	deleteDb(db, res);  // Firstly, calling for an absolute removal on the entire database //

	repopulateDb(db, res);	// Secondly, calling for a repopulation on the database, coming back to its original state
}



// ###############################################################################
// Routes


// Route to retrieve all the authors in the database
app.get('/', function (req, res) {
	
	db.all('SELECT * FROM gallery', function (err, rows) {		/* Selecting all the authors present in the database */

		if (err) {												/* In case an error is thrown */
			res.status(500);
			res.send("Internal Server Error.");
			return;
		}

		else {													/* In case the request was a success */
			res.status(200);
			return res.json(rows);
		}
	});
});


// Route to create a new author to be added in the database
app.post('/', function (req, res) {
	
	// Creating a list containing the necessary parameters for a correct submission
	var listOfParamsToReceive = ["author", "image", "alt", "tags", "description"]
	var result;

	var postedData = req.body;	// The posted data will be stored in the request body //
	var postedKeys = Object.keys(postedData);	// Creating a variable containing the post object keys that must match the parameters //

	var allOk = true;	// Creating a flag variable to be used in the end

	for (keyToCheck of listOfParamsToReceive) {		// Iterating through the posted object keys //
		if (postedKeys.indexOf(keyToCheck) == -1) {	// If a parameter was not given, a 400 bad request error is thrown //
			res.status(400);						
			res.send("Malformed submission.");
			allOk = false;
		}
	}

	if (allOk) {	// If all parameters were given, the insertion into the database will take place //

		db.run(`INSERT INTO gallery (author, alt, tags, image, description) VALUES (?, ?, ?, ?, ?)`, [
			postedData["author"],
			postedData["alt"],
			postedData["tags"],
			postedData["image"],
			postedData["description"]
		]);

		db.get('SELECT id FROM gallery WHERE author=?', [postedData["author"]], function (err, res2) {	// Getting the ID of the just added author
																										// to be returned by the API
			if(err) {
				res2.status(500);
				res2.send("Internal Server Error.")
			}
			else {
			result = res2;																				
			return res.json(result);
			}
		});
	}
});


// Route to reset the database to its original state
app.get('/reset', function (req, res) {	
	resetDb(db, res);	// Calling the above-defined function to reset the databse
	res.status(200);	
	res.send("Database successfully reseted.");  // Message to be sent by the API, in case of a successfull resetting.
});


// Route to retrieve the author matching a specific ID given in the endpoint
app.get('/item/:id', function (req, res) {
	
	var authorId = req.params['id'];	// Variable to store the id given by the user in the URL

	db.all(`SELECT * FROM gallery WHERE id=?`, [authorId], function (err, row) {	/* Selecting the author matching the ID from the database */

		if (err) {						/* In case an error is thrown */
			res.status(500);
			res.send("Server error.");
			return;
		}

		else if (row.length == 0) {	   /* In case no server was thrown, but no author was found to match the right ID */
			res.status(404);
			res.send("Author not found.");
			return;
		}

		else {						  /* In case everything went fine */
			res.status(200);
			return res.json(row)
		}
	});
});


// Route to update a specific author matching the given ID in the endpoint
app.put('/item/:id', function (req, res) {

	var putId = req.params["id"];	// Storing the given ID into a variable

	db.all('SELECT id FROM gallery', function (err, rows) {		/* Selecting the matching ID from the database */

		if(err) {												/* In case an error is thrown */
			res.status(500);
			res.send("Internal Server Error.");	
		}

		else {
			var idFound = false;			// Flag variable to store a boolean value whether the ID was found or not
			rows.forEach(function (row) {	// If the ID was found, the flag variable will be assigned to true, otherwise it will remain false
				if (row.id == putId) {
					idFound = true;
				}
			});
	
			if (!idFound) {					// In case the ID was not found
				res.status(404);
				res.send("Impossible to update. Author not found.");

			} else {						// If the ID was found, the update process begins

				// Creating a list containing the necessary parameters for a correct submission
				var listOfParamsToReceive = ["author", "image", "alt", "tags", "description"]; 
	
				var updateData = req.body;	// Passing the data to be updated into the request body
				var updateDataKeys = Object.keys(updateData); // Creating a variable containing the update object keys that must match the parameters
	
				var allOk = true;	// Flag variable firstly set to true

				for (keyToCheck of listOfParamsToReceive) {		// Iterating through all the parameters needed for update

					if (updateDataKeys.indexOf(keyToCheck) == -1) {	// If a paramenter was not not found in the update object, throw an error

						res.status(400);	// Malformed update request happened
						allOk = false;
					}
				}
	
				if (allOk) {	// If everything went ok, it is time to perform an update on the database
	
					db.run(`UPDATE gallery SET author=?, alt=?, tags=?, image=?, description=? WHERE id=?`, [
						updateData["author"],
						updateData["alt"],
						updateData["tags"],
						updateData["image"],
						updateData["description"],
						putId
					]);
	
				}
				updateData['id'] = parseInt(putId);
				return res.json(updateData);
			}}})});


// Route to delete an author matching the given id on the endpoint
app.delete('/item/:id', function (req, res) {

	var deleteId = req.params["id"];	// Storing the given ID into a variable

	db.all('SELECT author FROM gallery WHERE id=?', [deleteId], function(err, row) { /* Selecting the author matching the ID from the database */

		if (err) {						// In case an error is thrown //
			res.status(500);	
			res.send("Internal Server Error.");
		}

		else if (row.length == 0) {		// In case no error was thrown, but no author was found to match the right ID */
			res.status(404);
			res.send("Impossible to delete. Author not found.");
			return;
		}

		else {							// In case everything went as expected, it is time to perform a delete on the database
			db.run(`DELETE FROM gallery WHERE id=?`, [deleteId]);
			res.status(200);
			res.send("Author deleted successfully.");
		}
	})
	return;
});



// ###############################################################################
// This should start the server, after the routes have been defined, at port 3000:

app.listen(3000);
console.log("Your Web server should be up and running, waiting for requests to come in. Try http://localhost:3000/hello");

// ###############################################################################
// Some helper functions called above
function my_database(filename) {
	// Conncect to db by opening filename, create filename if it does not exist:
	var db = new sqlite.Database(filename, (err) => {
		if (err) {
			console.error(err.message);
		}
		console.log('Connected to the phones database.');
	});
	// Create our phones table if it does not exist already:
	repopulateDb(db, null);
	return db;
}
