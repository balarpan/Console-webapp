"use strict";

const quickURL = 'https://svc-5024.birweb.1prime.ru/v2/QuickSearch?term='

function companySelected(id, selPane) {
	selPane.innerHTML = '';
	selPane.style.opacity = 0;
	const respane = document.getElementById('company-brief-card');
	respane.innerHTML = '<div class="spinner"></div>';

	let url = 'https://api.codetabs.com/v1/proxy/?quest=' + encodeURIComponent('https://site.birweb.1prime.ru/company-brief/' + id);
	console.log('fetching ' + url);
	fetch(url).then(function (response) {
		return response.text();
	}).then(function (html) {

		// Convert the HTML string into a document object
		var parser = new DOMParser();
		var doc = parser.parseFromString(html, 'text/html');

		// Get the image file
		// var img = doc.querySelector('img');
		// console.log(img);

		var bir = {};

		bir['Благонадежность'] = doc.querySelector('div.ranged-card__content__value').textContent;
		// var score_desc = doc.querySelector('div.ranged-card__content__value-description__legend__value').textContent;
		bir['Кредитоспособность'] = doc.querySelector('bir-widget-ranged-card.company-overview__credit').querySelector('div.ranged-card__content__value').textContent;
		var dsec = doc.querySelector('bir-company-size div.company-size > div.company-size__content');
		bir['Размер компании'] = dsec.querySelector('a.company-size__content__value').textContent
		bir['Тип компании'] = dsec.ownerDocument.evaluate("//span[preceding::div[text()='Тип компании']]", dsec, null, XPathResult.ANY_TYPE, null ).iterateNext().textContent;
		bir['Численность сотрудников'] = document.evaluate("//span[preceding::div[text()='Численность сотрудников']]", dsec, null, XPathResult.ANY_TYPE, null ).iterateNext().textContent;

		dsec = doc.querySelector('bir-company-authorized-capital > div.company-card-widget');
		bir['Уставный капитал'] = dsec.querySelector('div.company-card-widget__value').textContent.trim();

		dsec = doc.querySelector('bir-company-tax-mode.company-overview__tax > div.company-card-widget');
		bir['Режим налогообложения'] = dsec.querySelector('div.company-card-widget__value').textContent.trim();

		// dsec = doc.querySelector('bir-company-chiefs.company-overview__chiefs > bir-widget-frame');
		// bir['Руководители'] = document.evaluate("//a[starts-with(@href, '/person-brief/')]", dsec, null, XPathResult.ANY_TYPE, null ).iterateNext().textContent;

		console.log(bir);

		var out='';
		for (const [key, value] of Object.entries(bir)) {
			out += '<div><span>' + key + '</span>:&nbsp;<span>' + value + '</span></div>';
		}
		respane.innerHTML = out;

	}).catch(function (err) {
		// There was an error
		console.warn('Something went wrong.', err);
		respane.innerHTML = "<span>Ошибка получения данных</span>";
	});

}


function birsearchinput(e, respane) {
    e.stopPropagation();
    e.preventDefault();
    let srchValue = e.target.value.trim().toLowerCase();
    if (!srchValue.length || 2>srchValue.length ) {
    	respane.innerHTML = '';
    	respane.style.opacity = 0;
    	return
    }

    function sresponse(data) {
    	data.forEach((rec) => {
    		let id = rec['id'];
    		const newDiv = document.createElement("div");
    		newDiv.className = 'item';
    		newDiv.innerHTML = '<span>' + rec['shortName'] + '</span>'
	    		+ '<div class="details">ИНН:<span>' + rec['inn'] + '</span> ОГРН:<span>' + rec['ogrn'] + '</span></div>'
	    	newDiv.onclick = function () {
	    		// window.location.href = 'https://site.birweb.1prime.ru/company-brief/' + id;
	    		companySelected(id, respane);
	    	}.bind(id, respane);
	    	respane.appendChild(newDiv);
    	});

		respane.style.opacity = 1;
    }
    function serror(err) {
    	respane.innerHTML = '';
    	respane.style.opacity = 0;
    }

	respane.innerHTML = '';
	respane.style.opacity = 0;
    const fetchPromise = fetch(quickURL + encodeURIComponent(srchValue));
    fetchPromise
	    .then((response) => response.json(), serror.bind(this))
	    .then(sresponse.bind(this));
}


window.addEventListener('load', function () {
	const birsearch = document.getElementById("birsearch");
	const birsearchres = document.getElementById("birsearchres");

	birsearch.addEventListener("input", (e) => {
		birsearchinput(e, birsearchres);
	});
});