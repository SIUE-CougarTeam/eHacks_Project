SQL Tables Queries README

Table Definitions

Table: roots
	
Columns:
	
	id: An automatically incrementing integer used as the primary key for each record in the table.
	
	title: A string of up to 255 characters representing the title of the root.
	
	description: A text field allowing for longer descriptions of the root.
	
	date_created: A timestamp indicating the date and time the record was created, with a default value of the current timestamp.
	
	
	branches_id: An integer field representing the foreign key referencing the id field in the branches table.
	
	username: A string of up to 30 characters representing the username associated with the root.
	
Foreign Key Constraint:
	
	branches_id: References the id field in the branches table.


Table: branches

Columns:

	id: An automatically incrementing integer used as the primary key for each record in the table.

	nodes_id: An integer field representing the foreign key referencing the id field in the nodes table.

Foreign Key Constraint:

	nodes_id: References the id field in the nodes table.


Table: nodes

Columns:

	id: An automatically incrementing integer used as the primary key for each record in the table.

	title: A string of up to 255 characters representing the title of the node.
	
	description: A text field allowing for longer descriptions of the node.

	morality: A string of up to 20 characters representing the morality associated with the node.

	username: A string of up to 30 characters representing the username associated with the node.


