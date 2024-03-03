Data Base Table Definitions


Table: roots

Columns:
id: An auto-incrementing integer serving as the primary key for each record in the table.
title: A string of up to 255 characters representing the title of the root.
prompt: A text field allowing for longer prompts associated with the root.
date_created: A timestamp indicating the date and time the record was created, with a default value of the current timestamp.
root_lock: A boolean field (represented by TINYINT) indicating whether the root is locked or not, with a default value of 0.


Table: branches

Columns:
id: An auto-incrementing integer serving as the primary key for each record in the table.
branch_id: An integer representing the branch identifier.
root_id: An integer representing the foreign key referencing the id field in the roots table.


Table: nodes

Columns:
id: An auto-incrementing integer serving as the primary key for each record in the table.
root_id: An integer representing the foreign key referencing the id field in the roots table.
branch_id: An integer representing the foreign key referencing the id field in the branches table.
title: A string of up to 255 characters representing the title of the node.
content: A text field allowing for longer content associated with the node.
date_created: A timestamp indicating the date and time the record was created, with a default value of the current timestamp.

