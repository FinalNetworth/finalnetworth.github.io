var formatter = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

window.onload = function() {
  var data = JSON.parse(decodeURIComponent(window.location.hash.substr(1)));

  for (var key in data) {
    var element = document.getElementById(key);
    element.value = data[key];
    element.dispatchEvent(new Event('change'));
  }

  recalculate();
}

function recalculate() {
  var rules = document.querySelectorAll('.data');

  var age = parseInt(document.getElementById('age').value);
  var startAge = age; 
  var death = parseInt(document.getElementById('death').value);

  var value = new Array(death - age + 1).fill(new Decimal(0));

  var ammortizationTable = [];

  for (age; age <= death; age++) {
    for (var x = 0; x < rules.length; x++) {
      if (age >= rules[x].childNodes[7].value && age <= rules[x].childNodes[9].value) {
        var currentAmount = value[age - startAge];
        var changeAmount = new Decimal(numbersOnly(rules[x].childNodes[3].value));
        var changeFrequency = new Decimal(numbersOnly(rules[x].childNodes[5].value));
        var changeTotal = changeAmount.times(changeFrequency);

        if (rules[x].childNodes[1].value == "+") {
          value[age - startAge] = currentAmount.add(changeTotal)
        }
        else {
          value[age - startAge] = currentAmount.sub(changeTotal);
        }
      }
    }
  }

  var compounded = [];
  for (var x = 0; x < value.length; x++) {
    var interest = new Decimal(1 + document.getElementById('interest').value * .01);

    var networth = new Decimal(numbersOnly(document.getElementById('startingNetworth').value));

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
    'interest': numbersOnly(document.getElementById('interest').value)
  };

  window.history.pushState({}, '', '#' + encodeURIComponent(JSON.stringify(saveData)));

  updateAmmortizationTable(ammortizationTable);
}

function add(event) {
  var div = document.createElement('div');
  div.className += 'data';
  div.className += ' flex-item';
  div.innerHTML = 'I plan to <select id="operation" onchange="recalculate()"><option value="+">save</option><option value="-">spend</option></select> <input id="amount" size="6" value="10000" onchange="formatMoneyEvent(event); recalculate()"></input> a <select id="frequency" onchange="recalculate()"><option value="1">year</option><option value="12">month</option></select> from age <input id="start" size="2" value="18" onchange="recalculate()"></input> to <input id="end" size="2" value="62" onchange="recalculate()"></input> <button onclick="remove(event); recalculate()">Delete</button>';
  event.srcElement.parentNode.parentNode.insertBefore(div, event.srcElement.parentNode);

  recalculate();
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

recalculate();
