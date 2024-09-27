/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unused-vars */
const fs = require('fs');

function addForeignKeysIfNotExists(originalSQL: string) {
  // Split the SQL string by lines
  const lines = originalSQL.split('\n');
  const createTables = {};
  let createTableSQL = '';
  let createForeignKeySQL = '';
  let outputSQL = '';
  let currentTable = null;

  lines.forEach((line: string) => {
    const trimmedLine = line.trim();

    if (trimmedLine.startsWith('CREATE TABLE')) {
      const tableName = trimmedLine.split(' ')[2].replace(/"/g, '');
      currentTable = tableName;
      createTables[tableName] =
        line.replace('CREATE TABLE', 'CREATE TABLE IF NOT EXISTS') + '\n';
    } else if (trimmedLine.startsWith('ALTER TABLE')) {
      currentTable = null;
      // Extract foreign key constraints
      const foreignKeyLine = trimmedLine.replace('ALTER TABLE', '').trim();
      const tableParts = foreignKeyLine.split('ADD');

      const foreignTable = tableParts[0].trim().replaceAll('"', '');
      const foreignKeyDefinition = tableParts[1].trim();
      const [
        _foreign,
        _key,
        columnName,
        _references,
        otherTable,
        otherTableColumn,
      ] = foreignKeyDefinition.replace(';', '').split(' ');
      const constraintName = [
        foreignTable,
        'fkey',
        columnName.replace(/["()]/g, ''),
      ].join('_');

      createForeignKeySQL += `DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = '${foreignTable}'
        AND constraint_name = '${constraintName}'
    ) THEN
        ALTER TABLE ${foreignTable}
        ADD CONSTRAINT ${constraintName}
        FOREIGN KEY ${columnName} REFERENCES ${otherTable} ${otherTableColumn};
    END IF;
END $$;
`;
    } else if (trimmedLine.length > 0) {
      if (currentTable) {
        createTables[currentTable] += line + '\n';
        if (line.endsWith(');')) {
          currentTable = null;
        }
      } else {
        outputSQL += line + '\n';
      }
    }
  });

  for (const table in createTables) {
    createTableSQL += createTables[table] + '\n';
  }

  outputSQL = createTableSQL + outputSQL + createForeignKeySQL;

  return outputSQL;
}

const sqlFilename = process.argv[2];
if (!sqlFilename) {
  console.error('Please provide a SQL filename as an argument.');
  process.exit(1);
}

function readSQLFile(filename) {
  try {
    return fs.readFileSync(filename, 'utf-8');
  } catch (error) {
    console.error(`Error reading file: ${error.message}`);
    process.exit(1);
  }
}

// Read the SQL file content
const originalSQL = readSQLFile(sqlFilename);

// Execute the function and log the output
const newSQL = addForeignKeysIfNotExists(originalSQL);
console.log(newSQL);
