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

function rowClick(e) {
    e.stopPropagation();
    // e.preventDefault();
    let clickRow = e.currentTarget;
    console.log( clickRow)
}

window.addEventListener('load', function () {
	var dummyComp = [
		['АО "ДФ ТРЕЙДИНГ"', 'Мосэнерго', '10.01.2025', '28.14.11.120', 'Московская обл.', 3066018, 3021018],
		['ООО "МИИТ"', 'МОЭК', '12.07.2025', '26.60.12.119', 'г.Москва', 41158982, 34150018],
		['ОАО "АСМ-ЗАПЧАСТЬ"', 'Мосэнерго', '05.11.2025', '24.20.13.130', 'г.Москва', 18140115, 14293521],
		['АО СКБ "ТУРБИНА"', 'ОГК-2', '08.04.2025', '28.14.13.131', 'Ставропольский край', 23148, 22120],
		['АО "ПРОГРЕСС-ЭЛЕКТРО"', 'ТГК-1', '11.03.2025', '', 'Мурманская обл.', 15185231, 11185264],
		['АО "ОДК-СЕРВИС"', 'ОГК-2', '18.12.2025', '43.22.12.160', 'Ставропольский край', 11283112, 11105263],
		['ЗАО "ЛСМУ СЗЭМ"', 'Мосэнерго', '20.01.2025', '68.20.12', 'Московская обл.', 722424, 720421],
		['ООО "Комус-Петербург"', 'НЗЛ', '18.04.2025', '17.21.13', 'г. Санкт-Петербург', 20466545, 19856515],
		['ООО "РусСоль"', 'ОГК-2', '02.08.2025', '25.94.11.110', 'Тюменская обл.', 162545, 118400],
		['ООО "Химпромсервис"', 'ТГК-1', '09.07.2025', '', 'Мурманская обл.', 91234522, 89012090],
	];
	dummyComp.forEach( function(x) {
		x.push(numberFormat(100 - parseInt(100*x.at(-1)	/ x.at(-2))));
		x.push(x.at(-3) - x.at(-2))
	});
	const dummySum = dummyComp.reduce((partialSum, a) => partialSum + a.at(-1), 0);

	const birtable = document.getElementById("nmc-decrease-table").getElementsByTagName('tbody')[0];
	const birtable_footer = document.getElementById("nmc-decrease-table").getElementsByTagName('tfoot')[0];
	const progress = document.getElementById('nmc-progress');

	function appendRow(rec) {
		const styles = Array.from(Array(dummyComp.length).keys())
		let newRow = birtable.insertRow(-1);
		newRow.onclick = rowClick;
		let cellNum = 0;
		rec.forEach( (r1) => {
			let cell = newRow.insertCell();
			cell.classList.add('st' + styles[cellNum]);
			let txt = isNumeric(r1) ? numberFormat(r1) : r1;
			let newText = document.createTextNode(txt);
			let newTag;
			if (!cellNum) {
				newTag = document.createElement('a');
				newTag.setAttribute('href', "birsearch.html?srchname=" + encodeURIComponent(r1));
				newTag.appendChild(newText);
			}
			else
				newTag = newText;
			cell.appendChild(newTag);
			cellNum += 1;
		});
	}

	function finishTable() {
		setTimeout(function (progress) { progress.style.display = "none"; }.bind(null,progress), 500);
		let footer = document.getElementById("nmc-decrease-table").createTFoot();
		let row = footer.insertRow(0);
		let cell = row.insertCell(0);
		cell.colSpan = dummyComp[0].length - 1;
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