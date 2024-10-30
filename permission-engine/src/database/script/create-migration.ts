import fs from 'fs';

const help = `
  Creates a migration sql file in src/database/sql/migrations directory

  usage: yarn migration:create {migrationName}
`;
const commands = {
  help,
  h: help,
  H: help,
};
const input = process.argv[2];
const timestamp = Date.now();

if (!input) {
  console.log(commands.help);
  process.exit();
}
if (commands[input]) {
  console.log(commands[input]);
  process.exit();
}

fs.writeFileSync(
  `src/database/sql/migrations/${timestamp}_${input}.sql`,
  `-- migration ${timestamp}_${input}`,
);
