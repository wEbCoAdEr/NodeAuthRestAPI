const fs = require('fs'); // File system module to read directory contents
const path = require('path'); // Path module to handle and transform file paths
const readline = require('readline'); // Readline module to create an interface for reading data from a readable stream (such as process.stdin)
const connectDB = require('./src/utils/connectDB'); // Custom module to connect to the database

// Set directories
const factoriesDir = path.join(__dirname, 'src', 'models', 'factories');
const seedersDir = path.join(__dirname, 'src', 'models', 'seeders');

// Function to dynamically import the chalk module
async function loadChalk() {
  const chalk = await import('chalk'); // Importing chalk as an ES module
  return chalk.default; // Returning the default export of chalk
}

const rl = readline.createInterface({
  input: process.stdin, // Standard input (keyboard)
  output: process.stdout // Standard output (console)
});

// Function to list files in a directory
const listFiles = async (dir, type) => {
  const chalk = await loadChalk();
  console.log(`\n- Scanning for available ${type}s`);
  const files = fs.readdirSync(dir).filter(
    file => file !== 'index.js' && file.endsWith('.js')
  );

  const totalFiles = files.length; // Total number of files found
  console.log(chalk.green(`- Found ${totalFiles} ${type}${totalFiles > 1 ? 's' : ''}`));

  if (totalFiles === 0) {
    console.log(chalk.red(` - No ${type}s found`));
    return [];
  }

  console.log(chalk.yellow(`\nAvailable ${type}s:`));

  files.forEach((file, index) => {
    console.log(chalk.cyan(`${index + 1}. ${file}`));
  });

  return files;
};

// Function to handle running a seeder or factory
const runFile = async (dir, files, input, isFactory = false) => {
  const chalk = await loadChalk();
  let fileToRun;
  if (isNaN(input)) {
    fileToRun = files.find(file => file === input);
  } else {
    fileToRun = files[Number(input) - 1];
  }

  if (!fileToRun) {
    console.log(chalk.red('\n- Invalid selection\n'));
    return;
  }

  try {
    const moduleToRun = require(path.join(dir, fileToRun));

    if (moduleToRun.run && typeof moduleToRun.run === 'function') {
      if (isFactory) {
        rl.question(chalk.blue("Enter the number of records to create: "), async (numRecords) => {
          await moduleToRun.run(parseInt(numRecords, 10));
          console.log(chalk.green(`\n- ${fileToRun} ran successfully\n`));
          displayMainMenu();
        });
      } else {
        await moduleToRun.run();
        console.log(chalk.green(`\n- ${fileToRun} ran successfully\n`));
        displayMainMenu();
      }
    } else {
      console.log(chalk.red(`File ${fileToRun} does not export a run function`));
    }
  } catch (err) {
    console.error(chalk.red(`Error running file ${fileToRun}:`), err);
  }
};

// Function to display the main menu and handle user interaction
const displayMainMenu = async () => {
  const chalk = await loadChalk();

  console.log(chalk.yellow("\nAvailable Tools:"));
  console.log(chalk.cyan('1. Factory'));
  console.log(chalk.cyan('2. Seeder'));

  rl.question(chalk.blue("\nEnter the tool number to run: "), async (toolInput) => {
    const toolChoice = parseInt(toolInput, 10);
    let files;

    switch (toolChoice) {
      case 1:
        files = await listFiles(factoriesDir, 'factory');
        if (files.length > 0) {
          rl.question(chalk.blue("\nEnter the factory number or name to run: "), async (factoryInput) => {
            await runFile(factoriesDir, files, factoryInput, true);
          });
        } else {
          displayMainMenu();
        }
        break;
      case 2:
        files = await listFiles(seedersDir, 'seeder');
        if (files.length > 0) {
          rl.question(chalk.blue("\nEnter the seeder number or name to run: "), async (seederInput) => {
            await runFile(seedersDir, files, seederInput);
          });
        } else {
          displayMainMenu();
        }
        break;
      default:
        console.log(chalk.red('\n- Invalid tool selection\n'));
        displayMainMenu();
    }
  });
};

// Main function to start the application
const start = async () => {
  await connectDB();
  const chalk = await loadChalk();

  // ASCII text banner
  const asciiText = `
                  _                
                 | |               
 _ __  _   _  ___| | ___ _   _ ___ 
| '_ \\| | | |/ __| |/ _ \\ | | / __|
| | | | |_| | (__| |  __/ |_| \\__ \\
|_| |_|\\__,_|\\___|_|\\___|\\__,_|___/                                                 
`;

  console.log(chalk.hex("#104EB2").bold(asciiText));
  console.log(chalk.hex("#104EB2").bold("___________________________________"));
  console.log(chalk.white("\nVERSION:") + chalk.cyan(" 1.0 Preview"));
  console.log(chalk.white("AUTHOR:") + chalk.cyan(" Skarbol Tech"));
  console.log(chalk.white("DEV:") + chalk.cyan(" Rohsin Al Razi (wEbCoAdEr)"));
  console.log(chalk.hex("#104EB2").bold("___________________________________"));

  displayMainMenu(); // Display the main menu to start the process
};

start(); // Start the process