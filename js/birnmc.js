"use strict";

const delayLoop = (fn, delay) => {
  return (x, i) => {
    setTimeout(() => {
      fn(x);
    }, i * delay);
  }
};

function isNumeric(str) {
  if (typeof str =='number') return true
  if (typeof str != "string") return false
  return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
         !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}

const numberFormat = (number) => String(number).replace(
    /^\d+/,
    number => [...number].map(
        (digit, index, digits) => (
            !index || (digits.length - index) % 3 ? '' : ' '
        ) + digit
    ).join('')
);

window.addEventListener('load', function () {
	var dummyComp = [
		['АО "ДФ ТРЕЙДИНГ"', '10.01.2025', 3066018, 3021018],
		['ООО "МИИТ"', '12.07.2025', 41158982, 34150018],
		['ОАО "АСМ-ЗАПЧАСТЬ"', '05.11.2025', 18140115, 14293521],
		['АО СКБ "ТУРБИНА"', '08.04.2025', 23148, 22120],
		['АО "ПРОГРЕСС-ЭЛЕКТРО"', '11.03.2025', 15185231, 11185264],
		['АО "ОДК-СЕРВИС"', '18.12.2025', 11283112, 11105263],
	];
	dummyComp.forEach((x) => x.push(x[2] - x[3]));
	const dummySum = dummyComp.reduce((partialSum, a) => partialSum + a[4], 0);

	const birtable = document.getElementById("nmc-decrease-table").getElementsByTagName('tbody')[0];
	const birtable_footer = document.getElementById("nmc-decrease-table").getElementsByTagName('tfoot')[0];
	const progress = document.getElementById('nmc-progress');

	function appendRow(rec) {
		let newRow = birtable.insertRow(-1);
		rec.forEach( (r1) => {
			let cell = newRow.insertCell();
			let txt = isNumeric(r1) ? numberFormat(r1) : r1;
			let newText = document.createTextNode(txt);
			cell.appendChild(newText);
		});
	}

	function finishTable() {
		setTimeout(function (progress) { progress.style.display = "none"; }.bind(null,progress), 500);
		let footer = document.getElementById("nmc-decrease-table").createTFoot();
		let row = footer.insertRow(0);
		let cell = row.insertCell(0);
		cell.colSpan = "4";
		cell.appendChild(document.createTextNode('Итого:'));
		cell = row.insertCell(1);
		cell.appendChild(document.createTextNode(numberFormat(dummySum)));
	}

	// dummyComp.forEach(delayLoop(appendRow, 1000));

	dummyComp.forEach( (rec, rec_i) => {
		setTimeout(() => {
			appendRow(rec);
			let prog = parseInt(100 * (rec_i+1) / dummyComp.length);
			progress.style.setProperty("--progressbar", `${prog}%`);
			if (prog >= 100)
				finishTable();
		}, rec_i * 1000 * Math.random()*1);
	})
	// for (let rec_i=0; rec_i < dummyComp.length; rec_i++) {
	// 	let rec = dummyComp[rec_i];
	// 	appendRow(rec);
	// 	let prog = parseInt(100 * (rec_i+1) / dummyComp.length);
	// 	progress.style.setProperty("--progressbar", `${prog}%`);

	// }
	// setTimeout(function (progress) { progress.style.display = "none"; }.bind(null,progress), 500);

});