function recalculate() {
  console.log('Calculating networth...');
}

function add(event) {
  var div = document.createElement('div');
  div.className = 'flex-item';
  div.innerHTML = 'I plan to <select><option>save</option><option>spend</option></select> $<input size="6" value="10000"></input> a <select><option>year</option><option>month</option></select> from age <input size="2" value="18"></input> to <input size="2" value="62"></input> <button onclick="remove(event)">Delete</button>';
  event.srcElement.parentNode.parentNode.insertBefore(div, event.srcElement.parentNode);
}

function remove(event) {
  event.srcElement.parentNode.remove();

  recalculate();
}

recalculate();
