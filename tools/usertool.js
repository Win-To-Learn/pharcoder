/**
 * usertool.js
 *
 * Created by jay on 10/23/17
 */

const fs = require('fs');
const yargs = require('yargs');
const parse = require('csv-parse');
const bcrypt = require('bcryptjs');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;

const mongoUri = require('../src/server/config').mongoUri;

function connectToDB () {
    return MongoClient.connect(mongoUri)
        .catch((err) => {
            console.log('Cannnot connect to DB');
            console.log(err);
            process.exit(1);
        })
}

function addUsers (db, people, regimes, csv) {
    let input = fs.readFileSync(csv);
    let parser = parse();
    let regimeId;
    parser.on("readable", () => {
        let record;
        while (record = parser.read()) {
            let player = {
                username: record[0],
                password: bcrypt.hashSync(record[1], 8),
                codeSnippets: {},
                regimeId,
                expired: false,
                expirationDate: new Date(3000, 11, 31),
                cType: 'Player'
            };
            if (record[2]) {
                let d = new Date(record[2]);
                if (!isNaN(d.getTime())) {
                    player.expirationDate = d;
                }
            }
            people.insertOne(player)
                .then((res) => {
                    if (res.insertedCount === 1) {
                        console.log(`Inserted ${player.username} with id ${res.insertedId}`);
                    } else {
                        console.log(`Problem inserting ${player.username}`);
                    }
                })
                .catch((err) => {
                    console.log(`DB Error: ${err}`);
                });
        }
    });
    parser.on("finish", () => {
        console.log('Shutting down DB');
        setTimeout(() => {
            db.close();
        }, 5000);
    });
    regimes.find({name: "Legacy Regime"}).limit(1).next().then((regime) => {
        regimeId = regime._id.toHexString();
        parser.write(input);
        parser.end();
    });
}

function main () {
    let argv = yargs
        .command('add <csv>', 'Add users from CSV file')
        .help()
        .argv;

    connectToDB().then((db) => {
        console.log('Connected to DB');
        let people = db.collection('people');
        let regimes = db.collection('regimes');

        if (argv.csv) {
            addUsers(db, people, regimes, argv.csv);
        }
    });
}

main();



