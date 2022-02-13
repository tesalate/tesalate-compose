import dotenv from 'dotenv';
import { createSpinner } from 'nanospinner';
import { MongoClient } from 'mongodb';
import chargeSessions from './collections/chargesessions.json';
import driveSessions from './collections/drivesessions.json';
import flags from './collections/flags.json';
import users from './collections/users.json';
import mapPoints from './collections/mappoints.json';
import reminders from './collections/reminders.json';
import superchargers from './collections/superchargers.json';
import vehicleData from './collections/vehicledata.json';
import vehicles from './collections/vehicles.json';
import teslaAccounts from './collections/teslaaccounts.json';
import { Charger, ChargeSession, DriveSession, Flag, MapPoint, Reminder, TeslaAccount, User, Vehicle, VehicleData } from '../../tesalate-data-collector/src/models/index.js';

console.clear();
dotenv.config();
const { MONGO_INITDB_ROOT_USERNAME, MONGO_INITDB_ROOT_PASSWORD, BUILD_ENVIRONMENT, MONGO_HOST_PORT, MONGO_REPLICA_SET_NAME, BASE_MONGO_INITDB_DATABASE } = process.env;

const spinner = createSpinner();

const dbName = `${BASE_MONGO_INITDB_DATABASE}_${BUILD_ENVIRONMENT}`;
const uri = `mongodb://${MONGO_INITDB_ROOT_USERNAME}:${MONGO_INITDB_ROOT_PASSWORD}@localhost:${MONGO_HOST_PORT}/${dbName}?authSource=admin&readPreference=primary&directConnection=true&ssl=false`;
let client = new MongoClient(uri);

try {
  spinner.start({ text: `Connecting to ${uri}` });
  await client.connect();
  spinner.success({ text: `Connected to ${uri}` });
  spinner.clear();
} catch (error) {
  spinner.error({ text: error });
  process.exit(1);
}
const database = client.db(dbName);

spinner.start({ text: 'Inserting Documents' });

const userSpinner = createSpinner('Inserting Users').start();
await database
  .collection('users')
  .insertMany(users.map((el) => new User(el)))
  .then(() => userSpinner.success({ text: 'Inserted Users' }))
  .catch((err) => userSpinner.error({ text: err }));

const chargeSpinner = createSpinner('Inserting Charge Sessions').start();
await database
  .collection('chargesessions')
  .insertMany(chargeSessions.map((el) => new ChargeSession(el)))
  .then(() => chargeSpinner.success({ text: 'Inserted Charge Sessions' }))
  .catch((err) => chargeSpinner.error({ text: err }));

const driveSpinner = createSpinner('Inserting Drive Sessions').start();
await database
  .collection('drivesessions')
  .insertMany(driveSessions.map((el) => new DriveSession(el)))
  .then(() => driveSpinner.success({ text: 'Inserted Drive Sessions' }))
  .catch((err) => driveSpinner.error({ text: err }));

const flagSpinner = createSpinner('Inserting Flags').start();
await database
  .collection('flags')
  .insertMany(flags.map((el) => new Flag(el)))
  .then(() => flagSpinner.success({ text: 'Inserted Flags' }))
  .catch((err) => flagSpinner.error({ text: err }));

const mpSpinner = createSpinner('Inserting Map Points').start();
await database
  .collection('mappoints')
  .insertMany(mapPoints.map((el) => new MapPoint(el)))
  .then(() => mpSpinner.success({ text: 'Inserted Map Points' }))
  .catch((err) => mpSpinner.error({ text: err }));

const taSpinner = createSpinner('Inserting Tesla Accounts').start();
await database
  .collection('teslaaccounts')
  .insertMany(teslaAccounts.map((el) => new TeslaAccount(el)))
  .then(() => taSpinner.success({ text: 'Inserted Tesla Accounts' }))
  .catch((err) => taSpinner.error({ text: err }));

const vehicleSpinner = createSpinner('Inserting Vehicles').start();
await database
  .collection('vehicles')
  .insertMany(vehicles.map((el) => new Vehicle(el)))
  .then(() => vehicleSpinner.success({ text: 'Inserted Vehicles' }))
  .catch((err) => vehicleSpinner.error({ text: err }));

const vdSpinner = createSpinner('Inserting Vehicle Data').start();
await database
  .collection('vehicledata')
  .insertMany(vehicleData.map((el) => new VehicleData(el)))
  .then(() => vdSpinner.success({ text: 'Inserted Vehicle Data' }))
  .catch((err) => vdSpinner.error({ text: err }));

const reminderSpinner = createSpinner('Inserting Reminders').start();
await database
  .collection('reminders')
  .insertMany(reminders.map((el) => new Reminder(el)))
  .then(() => reminderSpinner.success({ text: 'Inserted Reminders' }))
  .catch((err) => reminderSpinner.error({ text: err }));

const chargerSpinner = createSpinner('Inserting Chargers').start();
await database
  .collection('chargers')
  .insertMany(superchargers.map((el) => new Charger(el)))
  .then(() => chargerSpinner.success({ text: 'Inserted Chargers' }))
  .catch((err) => chargerSpinner.error({ text: err }));

console.log('You can log in with the following user creds:');
console.table({
  email: 'test@example.com',
  password: 'abcd1234',
});
process.exit(0);
