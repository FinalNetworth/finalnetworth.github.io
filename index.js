var formatter = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

window.onload = function() {
  try {
    var data = JSON.parse(decodeURIComponent(window.location.hash.substr(1)));
 
    for (var key in data) {
      var element = document.getElementById(key);
 
      if (Array.isArray(data[key])) {
        for (var rule in data[key]) {
          add({'operation': data[key][rule].operation, 'amount': data[key][rule].amount, 'frequency': data[key][rule].frequency, 'start': data[key][rule].start, 'end': data[key][rule].end});
        }
      }
      else {
        element.value = data[key];
        element.dispatchEvent(new Event('change'));
      }
    }

    recalculate();
  }
  catch (e) {
    add({skip_url_hash: 1});
  }
}

function recalculate(options) {
  var rules = processRules(document.querySelectorAll('.data'));

  var age = parseInt(document.getElementById('age').value);
  var startAge = age; 
  var death = parseInt(document.getElementById('death').value);

  var value = new Array(death - age + 1).fill(new Decimal(0));

  var ammortizationTable = [];

  for (age; age <= death; age++) {
    for (var x = 0; x < rules.length; x++) {
      if (age >= rules[x].start && age <= rules[x].end) {
        var currentAmount = value[age - startAge];
        var changeAmount = new Decimal(numbersOnly(rules[x].amount));
        var changeFrequency = new Decimal(numbersOnly(rules[x].frequency));
        var changeTotal = changeAmount.times(changeFrequency);

        if (rules[x].operation == "+") {
          value[age - startAge] = currentAmount.add(changeTotal)
        }
        else {
          value[age - startAge] = currentAmount.sub(changeTotal);
        }
      }
    }
  }

  var compounded = [];
  var interest = new Decimal(1 + document.getElementById('interest').value * .01);
  var networth = new Decimal(numbersOnly(document.getElementById('startingNetworth').value));

  for (var x = 0; x < value.length; x++) {
    if (x != 0 && compounded[x - 1].toNumber() <= 0) {
      networth = new Decimal(0);
    } else if (x != 0) {
      networth = compounded[x - 1]
    }

    compounded[x] = interest.times(networth).add(value[x]);
    ammortizationTable.push({'age': x + startAge, 'networth': formatMoney(networth.toNumber()), 'contribution': formatMoney(value[x].toNumber()), 'interest': formatMoney(compounded[x].sub(networth).sub(value[x]).toNumber())});
  }

  document.getElementById('networth').innerHTML = formatter.format(parseInt(compounded[compounded.length - 1].toString()));

  var saveData = {
    'age': startAge, 
    'death': death, 
    'startingNetworth': numbersOnly(document.getElementById('startingNetworth').value),
    'interest': numbersOnly(document.getElementById('interest').value),
    'rules': rules
  };

  if (!options || options['skip_url_hash'] != 1) {
    window.history.pushState({}, '', '#' + encodeURIComponent(JSON.stringify(saveData)));
  }

  updateAmmortizationTable(ammortizationTable);
}

function add(options) {
  var default_args = {
    'operation': '+',
    'amount': formatMoney(1000),
    'frequency': 1,
    'start': 18,
    'end': 82,
    'skip_url_hash': 0
  }

  if (typeof options == "undefined") {
    options = [];
  }

  for(var index in default_args) {
    if(typeof options[index] == "undefined") options[index] = default_args[index];
  }

  var plusSelected = '';
  var minusSelected = '';

  var yearSelected = '';
  var monthSelected = '';

  if (options['operation'] == '+') {
    plusSelected = ' selected';
  }
  else {
    minusSelected = ' selected';
  }

  if (options['frequency'] == 1) {
    yearSelected = ' selected';
  }
  else {
    monthSelected = ' selected';
  }

  var div = document.createElement('div');
  div.className += 'data flex-item';
  div.innerHTML = 'I plan to <select id="operation" onchange="recalculate()"><option value="+"' + plusSelected + '>save</option><option value="-"' + minusSelected + '>spend</option></select> <input id="amount" size="6" value="' + options['amount'] + '" onchange="formatMoneyEvent(event); recalculate()"></input> a <select id="frequency" onchange="recalculate()"> <option value="1"' + yearSelected + '>year</option> <option value="12"' + monthSelected + '>month</option></select> from age <input id="start" size="2" value="' + options['start'] + '" onchange="recalculate()"></input> to <input id="end" size="2" value="' + options['end']+ '" onchange="recalculate()"></input> <button onclick="remove(event); recalculate()">Delete</button>';
 
  document.getElementById('container').insertBefore(div, document.getElementById('last'));

  recalculate(options);
}

function remove(event) {
  event.srcElement.parentNode.remove();

  recalculate();
}

function numbersOnly(questionableNumber) {
  return questionableNumber.replace(/\D/g,'');
}

function formatMoney(number) {
  return formatter.format(number);
}

function formatMoneyEvent(event) {
  event.srcElement.value = formatter.format(numbersOnly(event.srcElement.value));
}

function updateAmmortizationTable(data) {
  var tbody = document.getElementById('ammortization');
  tbody.innerHTML = '';

  for (var x=0; x < data.length; x++) {
    var newRow = tbody.insertRow();

    columns = ['age', 'networth', 'contribution', 'interest'];

    for (column in columns) { 
      var newCell = newRow.insertCell();
      var newText = document.createTextNode(data[x][columns[column]]);
      newCell.appendChild(newText);
    }
  }
}

function processRules(rules) {
  var pureRules = [];

  for (var x = 0; x < rules.length; x++) {
    var data = {
      'operation': rules[x].childNodes[1].value,
      'amount': rules[x].childNodes[3].value,
      'frequency': rules[x].childNodes[5].value,
      'start': rules[x].childNodes[7].value,
      'end': rules[x].childNodes[9].value,
    };

    pureRules.push(data);
  }

  return pureRules;
}
