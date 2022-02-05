#!/usr/bin/env node
import fs from 'fs';
import util from 'util';
import path from 'path';
import crypto from 'crypto';
import child_process from 'child_process';
import chalk from 'chalk';
import figlet from 'figlet';
import inquirer from 'inquirer';
import gradient from 'gradient-string';
import chalkAnimation from 'chalk-animation';
import { createSpinner } from 'nanospinner';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const exec = util.promisify(child_process.exec);

let PATH = path.resolve(__dirname, '..');
let defaultAll = false;
let overwriteEnvs = true;
let generateHash = false;
let startDocker = false;
let BUILD_ENVIRONMENT = 'dev';
let PUBLIC_URL = 'http://localhost:4400';
let APP_NAME = 'Tesalate';
let API_PORT = 4400;
let MONGO_HOST_PORT = 27017;
let MONGO_INITDB_ROOT_USERNAME = 'root';
let MONGO_INITDB_ROOT_PASSWORD = '1234';
let BASE_MONGO_INITDB_DATABASE = 'tesla_db';
let MONGO_REPLICA_SET_NAME = 'rs0';
let MONGO_INITDB_USERNAME = 'user';
let MONGO_INITDB_PASSWORD = '4321';
let JWT_SECRET = crypto.randomBytes(256).toString('base64');
let JWT_ACCESS_EXPIRATION_MINUTES = 90;
let JWT_REFRESH_EXPIRATION_DAYS = 90;
let JWT_RESET_PASSWORD_EXPIRATION_MINUTES = 10;
let JWT_VERIFY_EMAIL_EXPIRATION_MINUTES = 1440;
let SMTP_HOST = 'smtp.ethereal.email';
let SMTP_PORT = 587;
let SMTP_USERNAME = 'shaun.senger25@ethereal.email';
let SMTP_PASSWORD = '1234'; // THIS WILL NOT WORK
let EMAIL_FROM = `${APP_NAME} <noreply@${APP_NAME}.io>`;
let TESLA_OAUTH_V3_URL = 'https://auth.tesla.com/oauth2/v3';
let TESLA_OWNER_API_URL = 'https://owner-api.teslamotors.com/api/1';
let TESLA_OWNERAPI_CLIENT_ID = '81527cff06843c8634fdc09e8ac0abefb46ac849f38fe1e431c2ef2106796384';
let TESLA_OWNERAPI_CLIENT_SECRET = 'c7257eb71a564034f9419ee651c7d0e5f7aa6bfbd18bafb5c5c033b093bb2fa3';
let ACCEPTED_CORS = `"${PUBLIC_URL}"`;

console.clear();
const sleep = (ms = 1000) => new Promise((r) => setTimeout(r, ms));

const spinner = createSpinner();

async function welcome() {
  const rainbowTitle = chalkAnimation.rainbow(
    `${figlet.textSync(`tesalate.io`, {
      width: 80,
      whitespaceBreak: true,
    })}\n`
  );

  await sleep();
  rainbowTitle.stop();
}

async function pathSelect() {
  const answers = await inquirer.prompt({
    name: 'question_1',
    type: 'input',
    message: 'Where would you like run this script?',
    default() {
      return PATH;
    },
  });

  PATH = answers.question_1;
}

async function envSelect() {
  const answers = await inquirer.prompt({
    name: 'question_1',
    type: 'list',
    message: 'Choose an environment\n',
    choices: ['prod', 'staging', 'dev'],
  });

  BUILD_ENVIRONMENT = answers.question_1;
}

async function askOverwriteEnvs() {
  const answers = await inquirer.prompt({
    name: 'question_1',
    type: 'list',
    message: `Overwrite your current ${envExportPath} file?\n`,
    choices: ['yes', 'no'],
  });

  overwriteEnvs = answers.question_1 === 'yes';
}

async function askDefaultAll() {
  const answers = await inquirer.prompt({
    name: 'default_all',
    type: 'list',
    message: 'Default all environment variables?\n',
    choices: ['yes', 'no'],
  });

  defaultAll = answers.default_all === 'yes';
}

async function askPublicUrl() {
  const answers = await inquirer.prompt({
    name: 'public_url',
    type: 'input',
    message: 'What url will you use to access the UI?',
    default() {
      return PUBLIC_URL;
    },
  });

  PUBLIC_URL = answers.public_url;
}

async function askAppName() {
  const answers = await inquirer.prompt({
    name: 'app_name',
    type: 'input',
    message: 'What is the app name?',
    default() {
      return APP_NAME;
    },
  });

  APP_NAME = answers.app_name;
}

async function askMongoQuestions() {
  const answer0 = await inquirer.prompt({
    name: 'MONGO_HOST_PORT',
    type: 'input',
    message: 'What host port should mongo run on?',
    default() {
      return MONGO_HOST_PORT;
    },
  });

  const answer1 = await inquirer.prompt({
    name: 'root_user',
    type: 'input',
    message: 'Root user for DB?',
    default() {
      return MONGO_INITDB_ROOT_USERNAME;
    },
  });

  const answer2 = await inquirer.prompt({
    name: 'root_pass',
    type: 'input',
    message: `Password for ${answer1.root_user}?`,
    default() {
      return MONGO_INITDB_ROOT_PASSWORD;
    },
  });

  const answer3 = await inquirer.prompt({
    name: 'db_name',
    type: 'input',
    message: `Name of the db? (Leave out any ref to environment)`,
    default() {
      return BASE_MONGO_INITDB_DATABASE;
    },
  });

  const answer4 = await inquirer.prompt({
    name: 'replica_set_name',
    type: 'input',
    message: `Replica set name?`,
    default() {
      return MONGO_REPLICA_SET_NAME;
    },
  });

  const answer5 = await inquirer.prompt({
    name: 'db_user',
    type: 'input',
    message: `Username for readWrite user? (user that will be used by API to connect)`,
    default() {
      return MONGO_INITDB_USERNAME;
    },
  });

  const answer6 = await inquirer.prompt({
    name: 'db_user_pass',
    type: 'input',
    message: `Password for ${answer5.db_user}`,
    default() {
      return MONGO_INITDB_PASSWORD;
    },
  });

  MONGO_HOST_PORT = answer0.MONGO_HOST_PORT;
  MONGO_INITDB_ROOT_USERNAME = answer1.root_user;
  MONGO_INITDB_ROOT_PASSWORD = answer2.root_pass;
  BASE_MONGO_INITDB_DATABASE = answer3.db_name;
  MONGO_REPLICA_SET_NAME = answer4.replica_set_name;
  MONGO_INITDB_USERNAME = answer5.db_user;
  MONGO_INITDB_PASSWORD = answer6.db_user_pass;
}

async function askGenerateHash() {
  const answers = await inquirer.prompt({
    name: 'default_all',
    type: 'list',
    message: 'Would you like to use a generated hash for your jwt secret?\n',
    choices: ['yes', 'no'],
  });

  generateHash = answers.default_all === 'yes';
}

async function askAPIPort() {
  const answer1 = await inquirer.prompt({
    name: 'api_port',
    type: 'input',
    message: 'Port to access API on?',
  });
  API_PORT = answer1.api_port;
}

async function askJWTQuestions() {
  if (!generateHash) {
    const answer1 = await inquirer.prompt({
      name: 'jwt_secret',
      type: 'input',
      message: 'JWT Secret?',
    });
    JWT_SECRET = answer1.jwt_secret;
  }

  const answer2 = await inquirer.prompt({
    name: 'jwt_access_exp',
    type: 'input',
    message: `Number of minutes after which an access token expires?`,
    default() {
      return JWT_ACCESS_EXPIRATION_MINUTES;
    },
  });

  const answer3 = await inquirer.prompt({
    name: 'jwt_refresh_exp',
    type: 'input',
    message: `Number of days after which a refresh token expires?`,
    default() {
      return JWT_REFRESH_EXPIRATION_DAYS;
    },
  });

  const answer4 = await inquirer.prompt({
    name: 'jwt_reset_pass_exp',
    type: 'input',
    message: `Number of minutes after which a reset password token expires?`,
    default() {
      return JWT_RESET_PASSWORD_EXPIRATION_MINUTES;
    },
  });

  const answer5 = await inquirer.prompt({
    name: 'jwt_verify_email_exp',
    type: 'input',
    message: `Number of minutes after which a verify email token expires? (1440 = 1 day)`,
    default() {
      return JWT_VERIFY_EMAIL_EXPIRATION_MINUTES;
    },
  });

  JWT_ACCESS_EXPIRATION_MINUTES = answer2.jwt_access_exp;
  JWT_REFRESH_EXPIRATION_DAYS = answer3.jwt_refresh_exp;
  JWT_RESET_PASSWORD_EXPIRATION_MINUTES = answer4.jwt_reset_pass_exp;
  JWT_VERIFY_EMAIL_EXPIRATION_MINUTES = answer5.jwt_verify_email_exp;
}

async function askEmailQuestions() {
  const answer1 = await inquirer.prompt({
    name: 'smtp_host',
    type: 'input',
    message: 'SMTP Host?',
    default() {
      return SMTP_HOST;
    },
  });

  const answer2 = await inquirer.prompt({
    name: 'smtp_port',
    type: 'input',
    message: `SMTP Port?`,
    default() {
      return SMTP_PORT;
    },
  });

  const answer3 = await inquirer.prompt({
    name: 'smtp_username',
    type: 'input',
    message: `SMTP Username?`,
    default() {
      return SMTP_USERNAME;
    },
  });

  const answer4 = await inquirer.prompt({
    name: 'smtp_password',
    type: 'input',
    message: `SMTP Password?`,
    default() {
      return SMTP_PASSWORD;
    },
  });

  const answer5 = await inquirer.prompt({
    name: 'email_from',
    type: 'input',
    message: `Who are the emails from?`,
    default() {
      return EMAIL_FROM;
    },
  });

  SMTP_HOST = answer1.smtp_host;
  SMTP_PORT = answer2.smtp_port;
  SMTP_USERNAME = answer3.smtp_username;
  SMTP_PASSWORD = answer4.smtp_password;
  EMAIL_FROM = answer5.email_from;
}

async function askTeslaAPIQuestions() {
  const answer1 = await inquirer.prompt({
    name: 'tesla_oauth_url',
    type: 'input',
    message: 'Tesla V3 OAuth Endpoint?',
    default() {
      return 'https://auth.tesla.com/oauth2/v3';
    },
  });

  const answer2 = await inquirer.prompt({
    name: 'tesla_owner_url',
    type: 'input',
    message: `Tesla Owner API Endpoint?`,
    default() {
      return 'https://owner-api.teslamotors.com';
    },
  });

  TESLA_OAUTH_V3_URL = answer1.tesla_oauth_url;
  TESLA_OWNER_API_URL = answer2.tesla_owner_url;
}

async function askCORSQuestions() {
  const answer1 = await inquirer.prompt({
    name: 'accepted_cors',
    type: 'input',
    message: 'Accepted CORS? (If multiple sources, delimitate by commas)',
    default() {
      return PUBLIC_URL;
    },
  });

  ACCEPTED_CORS = answer1.accepted_cors.split(',').map((el) => `"${el.trim()}"`);
}

async function askStartDocker() {
  const answers = await inquirer.prompt({
    name: 'start_docker',
    type: 'list',
    message: 'Start Docker?\n',
    choices: ['yes', 'no'],
  });

  startDocker = answers.start_docker === 'yes';
}

await welcome();
await pathSelect();
await envSelect();

const envExportPath = `${PATH}/tesalate-compose/.env`;
const envExists = fs.existsSync(envExportPath);
const keyfilePath = `${PATH}/mongo/${BUILD_ENVIRONMENT}/keyfile`;
const dataPath = `${PATH}/mongo/${BUILD_ENVIRONMENT}/data`;
const keyExists = fs.existsSync(keyfilePath);

if (envExists) {
  await askOverwriteEnvs();
}

await exec(`mkdir -p ${dataPath}/mongo-0`);
await exec(`mkdir -p ${dataPath}/mongo-1`);
await exec(`mkdir -p ${dataPath}/mongo-2`);

if (!keyExists) {
  spinner.start({ text: 'Creating keyfile for mongo\n' });
  const { stderr: stderr1 } = await exec(`mkdir -p ${keyfilePath} && openssl rand -base64 756 > ${keyfilePath}/file.key`);

  if (stderr1) {
    spinner.error({ text: `stderr: ${stderr1}\n` });
  } else {
    const successMessage = `Created Keyfile: ${keyfilePath}/file.key`;
    spinner.success({ text: `${chalk.bgBlue(successMessage)}` });
  }

  spinner.clear();
  spinner.start({ text: 'Granting keyfile permissions\n' });

  const { stderr: stderr2 } = await exec(`chmod 600 ${keyfilePath}/file.key`);
  if (stderr2) {
    spinner.error({ text: `stderr: ${stderr2}\n` });
  } else {
    spinner.success({ text: `${chalk.bgBlue('Granted permissions to keyfile')}` });
  }
  spinner.clear();
} else {
  spinner.success({ text: chalk.bgBlue(`Keyfile already exists: ${keyfilePath}`) });
  spinner.clear();
}

if (overwriteEnvs) {
  if (BUILD_ENVIRONMENT !== 'prod') {
    await askDefaultAll();
  }

  if (!defaultAll) {
    await askPublicUrl();
    await askAppName();
    await askMongoQuestions();
    await askGenerateHash();
    await askAPIPort();
    await askJWTQuestions();
    await askEmailQuestions();
    await askTeslaAPIQuestions();
    await askCORSQuestions();
  }
  console.clear();
}

await askStartDocker();

let fig = figlet.textSync(`${BUILD_ENVIRONMENT.toUpperCase()} ENV`, {
  width: 80,
  whitespaceBreak: true,
});

const content = `
${fig.replace(/^/gm, '# ')}

BUILD_ENVIRONMENT=${BUILD_ENVIRONMENT}

## Public
PUBLIC_URL=${PUBLIC_URL}
APP_NAME=${APP_NAME}

## Mongo DB
MONGO_HOST_PORT=${MONGO_HOST_PORT}
# DO NOT CHANGE ROOT USER AFTER INITIAL RUN AS ROOT USER IS ONLY ADDED IF NOTHING IS IN THE DB
MONGO_INITDB_ROOT_USERNAME=${MONGO_INITDB_ROOT_USERNAME}
MONGO_INITDB_ROOT_PASSWORD="${MONGO_INITDB_ROOT_PASSWORD}"
BASE_MONGO_INITDB_DATABASE=${BASE_MONGO_INITDB_DATABASE}
MONGO_REPLICA_SET_NAME=${MONGO_REPLICA_SET_NAME}
## Mongo DB user
MONGO_INITDB_USERNAME=${MONGO_INITDB_USERNAME}
MONGO_INITDB_PASSWORD="${MONGO_INITDB_PASSWORD}"

MONGODB_URL="mongodb://${MONGO_INITDB_USERNAME}:${MONGO_INITDB_PASSWORD}@mongo-0:27017/${BASE_MONGO_INITDB_DATABASE}_${BUILD_ENVIRONMENT}?replicaSet=${MONGO_REPLICA_SET_NAME}&readPreference=primaryPreferred&authSource=${BASE_MONGO_INITDB_DATABASE}_${BUILD_ENVIRONMENT}"

## API
API_PORT=${API_PORT}

## JWT
JWT_SECRET="${JWT_SECRET}"
# Number of minutes after which an access token expires
JWT_ACCESS_EXPIRATION_MINUTES=${JWT_ACCESS_EXPIRATION_MINUTES}
# Number of days after which a refresh token expires
JWT_REFRESH_EXPIRATION_DAYS=${JWT_REFRESH_EXPIRATION_DAYS}
# Number of minutes after which a reset password token expires
JWT_RESET_PASSWORD_EXPIRATION_MINUTES=${JWT_RESET_PASSWORD_EXPIRATION_MINUTES}
# Number of minutes after which a verify email token expires
JWT_VERIFY_EMAIL_EXPIRATION_MINUTES=${JWT_VERIFY_EMAIL_EXPIRATION_MINUTES}

# SMTP configuration options for the email service
# For testing, you can use a fake SMTP service like Ethereal: https://ethereal.email/create
SMTP_HOST=${SMTP_HOST}
SMTP_PORT=${SMTP_PORT}
SMTP_USERNAME=${SMTP_USERNAME}
SMTP_PASSWORD="${SMTP_PASSWORD}"
EMAIL_FROM="${EMAIL_FROM}"

## TESLA API
TESLA_OAUTH_V3_URL=${TESLA_OAUTH_V3_URL}
TESLA_OWNER_API_URL=${TESLA_OWNER_API_URL}
TESLA_OWNERAPI_CLIENT_ID=${TESLA_OWNERAPI_CLIENT_ID}
TESLA_OWNERAPI_CLIENT_SECRET=${TESLA_OWNERAPI_CLIENT_SECRET}

## CORS
ACCEPTED_CORS=[${ACCEPTED_CORS}]
`.trim();

try {
  if (overwriteEnvs) {
    fs.writeFileSync(envExportPath, content);
    const text = `Generated variables in: ${envExportPath}`;
    console.log(`${chalk.bgBlue(text)}`.trimStart());
  }

  spinner.clear();

  if (startDocker) {
    let command;

    switch (BUILD_ENVIRONMENT) {
      case 'prod':
        command = 'docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d';
        break;
      case 'staging':
        command = 'docker compose -f docker-compose.yml -f docker-compose.staging.yml up -d';
        break;
      default:
        command = 'docker compose up -d';
        break;
    }
    spinner.start({ text: '🐳 Staring Docker 🐳\n' });
    const { stdout, stderr } = await exec(command);
    if (stderr) {
      spinner.error({ text: `stderr: ${stderr}` });
      process.exit(1);
    }
    console.log(`stdout: ${stdout}`);
    spinner.success({ text: `Docker has started` });
  }
} catch (err) {
  console.error(err);
  process.exit(1);
}
