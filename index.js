var formatter = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

function recalculate() {
  var rules = document.querySelectorAll('.data');

  var age = parseInt(document.getElementById('age').value);
  var startAge = age; 
  var death = parseInt(document.getElementById('death').value);
  
  var value = new Array(death - age).fill(new Decimal(0));

  var ammortizationTable = [];

  for (age; age < death; age++) {
    for (var x = 0; x < rules.length; x++) {
      if (age >= rules[x].childNodes[7].value && age <= rules[x].childNodes[9].value) {
        var currentAmount = value[age - startAge];
        var changeAmount = new Decimal(rules[x].childNodes[3].value);
        var changeFrequency = new Decimal(rules[x].childNodes[5].value);
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

  var firstIteration = true;
  var compounded = [];
  for (var x = 0; x < value.length; x++) {
    var interest = new Decimal(1 + document.getElementById('interest').value * .01);

    if (firstIteration) {
      var startingNetworth = new Decimal(numbersOnly(document.getElementById('startingNetworth').value));

      compounded[x] = interest.times(startingNetworth.add(value[x]));
      ammortizationTable = [{'age': x + startAge, 'networth': parseInt(startingNetworth.toString()), 'contribution': value[x].toString(), 'interest': parseInt(compounded[x].sub(startingNetworth).sub(value[x]).toString()) }];

      firstIteration = false;
    }
    else {
      compounded[x] = interest.times(compounded[x - 1].add(value[x])); 
      ammortizationTable.push({'age': x + startAge, 'networth': parseInt(compounded[x - 1].toString()), 'contribution': value[x].toString(), 'interest': parseInt(compounded[x].sub(compounded[x-1]).sub(value[x]).toString()) });
    }
  }

  document.getElementById('networth').innerHTML = formatter.format(parseInt(compounded[compounded.length - 1].toString()));

  updateAmmortizationTable(ammortizationTable);
}

function add(event) {
  var div = document.createElement('div');
  div.className += 'data';
  div.className += ' flex-item';
  div.innerHTML = 'I plan to <select id="operation" onchange="recalculate()" onmouseup="recalculate()"><option value="+">save</option><option value="-">spend</option></select> $<input id="amount" size="6" value="10000" onchange="recalculate()"></input> a <select id="frequency" onchange="recalculate()" onmouseup="recalculate()"><option value="1">year</option><option value="12">month</option></select> from age <input id="start" size="2" value="18" onchange="recalculate()"></input> to <input id="end" size="2" value="62" onchange="recalculate()"></input> <button onclick="remove(event); recalculate()">Delete</button>';
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

function formatStartingNetworth() {
  var networth = numbersOnly(document.getElementById('startingNetworth').value);
  document.getElementById('startingNetworth').value = formatter.format(networth);
}

function updateAmmortizationTable(data) {
  for (var x=0; x < data.length; x++) {
    var tbody = document.getElementById('ammortization');

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
