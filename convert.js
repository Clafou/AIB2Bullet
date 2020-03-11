'use strict';

const fs = require('fs');
const parse = require('csv-parse');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const args = process.argv;

if (args.length < 3) {
  throw 'Input file not provided';
}
if (args.length < 4) {
  throw 'Output file not provided';
}
const inputFile = args[2];
const outputFile = args[3];
let blankOrZero = (n) => (n == '' || n == '0.00');

console.log('Converting ' + inputFile);
var rows = [];
fs.createReadStream(inputFile)
.pipe(parse())
.on('data', function(data) {
    if (data[0] === 'Posted Account') {
      console.log('Skipped: Header');
      return
    }
    let row = {
        date: data[1],
        description: data[2],
        moneyOut: data[3],
        moneyIn: data[4],
    }
    if (blankOrZero(row.moneyIn) && blankOrZero(row.moneyOut)) {
      console.log('Skipped: ' + JSON.stringify(row))  // Skip information rows (without in or out amounts)
      return
    }
    rows.push(row)
})
.on('end', function() {
    console.log('Converted: ' + JSON.stringify(rows, null, 2))
    createCsvWriter({
      path: outputFile,
      header: [
        {id: 'date', title: 'Date'},
        {id: 'description', title: 'Description'},
        {id: 'moneyOut', title: 'Money Out'},
        {id: 'moneyIn', title: 'Money In'}
      ]
    })
    .writeRecords(rows)
    .then(()=> console.log(`Conversion to file ${ outputFile } completed successfully`));
})
