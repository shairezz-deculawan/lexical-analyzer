/*
  Design and Implementation of a Lexical Analyzer for SQL Queries
  CS302 - Automata Theory and Formal Languages

  This program recognizes a restricted subset of SQL tokens.
  It does NOT execute SQL or connect to a database.
*/

"use strict";

const KEYWORDS = new Set([
  "SELECT", "FROM", "WHERE", "INSERT", "INTO", "VALUES", "AND"
]);

const TWO_CHAR_OPERATORS = new Set([">=", "<>"]);
const ONE_CHAR_OPERATORS = new Set(["=", ">"]);
const DELIMITERS = new Set([",", ";", "(", ")"]);
const SINGLE_SYMBOLS = new Set(["*"]);

class LexicalError extends Error {
  constructor(message) {
    super(message);
    this.name = "LexicalError";
  }
}

/* Scan the input character by character and return [lexeme, tokenType] pairs. */
function tokenize(sql) {
  const tokens = [];
  let i = 0;

  while (i < sql.length) {
    const ch = sql[i];

    // Ignore whitespace between tokens.
    if (/\s/.test(ch)) {
      i++;
      continue;
    }

    // Read a single-quoted string and require a closing quote.
    if (ch === "'") {
      const start = i;
      i++;
      while (i < sql.length && sql[i] !== "'") i++;

      if (i >= sql.length) {
        throw new LexicalError(
          `Unterminated string literal starting at position ${start + 1}.`
        );
      }

      i++; // Include the closing quote.
      tokens.push([sql.slice(start, i), "STRING_LITERAL"]);
      continue;
    }

    // Recognize supported two-character operators before single characters.
    const pair = sql.slice(i, i + 2);
    if (TWO_CHAR_OPERATORS.has(pair)) {
      tokens.push([pair, "COMPARISON_OPERATOR"]);
      i += 2;
      continue;
    }

    // Reject unsupported operator patterns such as >>.
    if (ch === ">" && sql[i + 1] === ">") {
      throw new LexicalError(
        `Unsupported operator '>>' at position ${i + 1}.`
      );
    }

    // Recognize integers and decimals; reject identifiers starting with digits.
    if (/[0-9]/.test(ch)) {
      const numberMatch = sql.slice(i).match(/^[0-9]+(?:\.[0-9]+)?/);
      const lexeme = numberMatch[0];
      const end = i + lexeme.length;

      if (end < sql.length && /[A-Za-z_]/.test(sql[end])) {
        const invalidMatch = sql.slice(i).match(/^[0-9][A-Za-z0-9_]*/);
        const bad = invalidMatch ? invalidMatch[0] : lexeme;
        throw new LexicalError(
          `Invalid identifier '${bad}' at position ${i + 1}: ` +
          "identifiers cannot begin with a digit."
        );
      }

      // A period after a number must be followed by a digit.
      if (end < sql.length && sql[end] === "." &&
          (end + 1 >= sql.length || !/[0-9]/.test(sql[end + 1]))) {
        throw new LexicalError(`Invalid number near position ${i + 1}.`);
      }

      tokens.push([lexeme, lexeme.includes(".") ? "DECIMAL" : "INTEGER"]);
      i = end;
      continue;
    }

    // Read identifiers and classify reserved words as keywords.
    if (/[A-Za-z_]/.test(ch)) {
      const match = sql.slice(i).match(/^[A-Za-z_][A-Za-z0-9_]*/);
      const lexeme = match[0];
      const type = KEYWORDS.has(lexeme.toUpperCase()) ? "KEYWORD" : "IDENTIFIER";
      tokens.push([lexeme, type]);
      i += lexeme.length;
      continue;
    }

    // Supported one-character comparison operators.
    if (ONE_CHAR_OPERATORS.has(ch)) {
      tokens.push([ch, "COMPARISON_OPERATOR"]);
      i++;
      continue;
    }

    // Delimiters and asterisk.
    if (DELIMITERS.has(ch)) {
      tokens.push([ch, "DELIMITER"]);
      i++;
      continue;
    }

    if (SINGLE_SYMBOLS.has(ch)) {
      tokens.push([ch, "ASTERISK"]);
      i++;
      continue;
    }

    // Explicitly report unsupported symbols.
    if (ch === "@") {
      throw new LexicalError(`Unsupported symbol '@' at position ${i + 1}.`);
    }

    throw new LexicalError(
      `Unsupported character '${ch}' at position ${i + 1}.`
    );
  }

  return tokens;
}

const sqlInput = document.getElementById("sqlInput");
const analyzeBtn = document.getElementById("analyzeBtn");
const clearBtn = document.getElementById("clearBtn");
const acceptedBtn = document.getElementById("acceptedBtn");
const rejectedBtn = document.getElementById("rejectedBtn");
const statusBox = document.getElementById("status");
const tokenRows = document.getElementById("tokenRows");
const tokenCount = document.getElementById("tokenCount");

/* Update the status message and its appearance. */
function showStatus(message, type = "neutral") {
  statusBox.textContent = message;
  statusBox.className = `status ${type}`;
}

/* Display token data safely in the HTML table. */
function displayTokens(tokens) {
  tokenRows.replaceChildren();

  if (tokens.length === 0) {
    const row = document.createElement("tr");
    row.className = "empty";
    const cell = document.createElement("td");
    cell.colSpan = 2;
    cell.textContent = "No tokens were found.";
    row.appendChild(cell);
    tokenRows.appendChild(row);
    return;
  }

  for (const [lexeme, type] of tokens) {
    const row = document.createElement("tr");
    const lexemeCell = document.createElement("td");
    const typeCell = document.createElement("td");

    lexemeCell.textContent = lexeme;
    typeCell.textContent = type;

    row.append(lexemeCell, typeCell);
    tokenRows.appendChild(row);
  }
}

/* Analyze the user's input and display either tokens or an error. */
function analyzeQuery() {
  const query = sqlInput.value.trim();
  tokenRows.replaceChildren();
  tokenCount.textContent = "0 tokens";

  if (!query) {
    showStatus("Please enter an SQL query.", "neutral");
    return;
  }

  try {
    const tokens = tokenize(query);
    displayTokens(tokens);
    tokenCount.textContent = `${tokens.length} token${tokens.length === 1 ? "" : "s"}`;
    showStatus(
      `ACCEPTED: ${tokens.length} token(s) recognized. ` +
      "All tokens follow the defined lexical rules.",
      "success"
    );
  } catch (error) {
    showStatus(`REJECTED: ${error.message}`, "error");
    const row = document.createElement("tr");
    row.className = "empty";
    const cell = document.createElement("td");
    cell.colSpan = 2;
    cell.textContent = "No complete token list shown because an error was detected.";
    row.appendChild(cell);
    tokenRows.appendChild(row);
  }
}

analyzeBtn.addEventListener("click", analyzeQuery);

clearBtn.addEventListener("click", () => {
  sqlInput.value = "";
  displayTokens([]);
  tokenCount.textContent = "0 tokens";
  showStatus("Ready to analyze.", "neutral");
});

acceptedBtn.addEventListener("click", () => {
  sqlInput.value = "INSERT INTO products VALUES (101, 'Laptop', 999.99);";
  showStatus("Accepted example loaded. Click Analyze Query.", "neutral");
});

rejectedBtn.addEventListener("click", () => {
  sqlInput.value = "SELECT @user_id FROM logs;";
  showStatus("Rejected example loaded. Click Analyze Query.", "neutral");
});

// Allow Ctrl+Enter (or Cmd+Enter) to analyze the query quickly.
sqlInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
    analyzeQuery();
  }
});
