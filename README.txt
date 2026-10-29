SQL LEXICAL ANALYZER — JAVASCRIPT VERSION
CS302: Automata Theory and Formal Languages

FILES
- index.html: page layout
- style.css: visual design
- script.js: tokenizer and interactive behavior

HOW TO RUN
1. Extract the ZIP file.
2. Open the folder in VS Code.
3. Open index.html in a browser (double-click it), or use VS Code Live Server.
4. Enter an SQL query and click Analyze Query.

TEST EXAMPLES
Accepted:
SELECT name, age FROM users WHERE age >= 18;
INSERT INTO products VALUES (101, 'Laptop', 999.99);
SeLeCt first_name,last_name fRoM users;
SELECT*FROM users WHERE age<>0;

Rejected:
SELECT * FROM users WHERE name = 'John;
SELECT @user_id FROM logs;
SELECT 123var FROM table;
SELECT name FROM users WHERE age >> 18;
SELECT 'Unterminated string FROM users;

SCOPE
This program recognizes a restricted subset of SQL tokens based on the proposal.
It does not execute SQL, connect to a database, or validate complete SQL grammar.
