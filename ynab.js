const parse = require('csv-parse');
const fs = require('fs');
var transform = require('stream-transform');
var stringify = require('csv-stringify');
var accounting = require('accounting');
const moment = require('moment');

fs.readFile('input.txt', 'utf8', (err, data) => {
  if (err) {
    return console.log('hubo un error al leer el archivo', err);
  }

  parse(data, { delimiter: '\t', from: 2 }, function (err, output) {
    if (err) {
      return console.log('hubo un error en el archivo', err);
    }

    transform(output, row => {
      [date, document, office, description, reference, value] = row;

      date = formatDate(date);
      [inflow, outflow] = calculateValues(value);

      return [date, description, '', `${description} ${reference}`, outflow, inflow];
    }, (err, transformed) => {
      writeHeaders(transformed);
      stringify(transformed, writeFile);
    });
  });
});

function writeHeaders(data) {
  data.unshift(['Date', 'Payee', 'Category', 'Memo', 'Outflow', 'Inflow']);
}

function writeFile(err, csvData) {
  fs.writeFile('ynab.csv', csvData, err => {
    if (err) {
      console.log(err);
    }
  });
}

function formatDate(date) {
  return moment(date, "YYYY/MM/DD").format('DD/MM/YYYY');
}

function calculateValues(value) {
  let inflow = 0;
  let outflow = 0;

  value = accounting.unformat(value);

  if (value > 0) {
    inflow = value;
  } else {
    outflow = Math.abs(value);
  }

  return [inflow, outflow];
}