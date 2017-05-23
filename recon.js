var fs = require('fs');
var parse = require('csv-parse');
var round10 = require('round10').round10;

var accounts = ['regchk', 'pmt', 'biz', 'regsav', 'house', 'vaca', 'instant'];
var results = {};

accounts.forEach(function (acct) {
	var bank = fs.readFileSync('ExportedTransactions_' + acct + '.csv').toString();
	var mint = fs.readFileSync('transactions_' + acct + '.csv').toString();

	parse(bank, {}, function (err, bankParsed) {
		parse(mint, {}, function(errMint, mintParsed) {
			// Create a hash
			var mintIdx = {};
			for (var row = 1; row < mintParsed.length; row++) {
				var hash = getHashCode(mintParsed[row][0], mintParsed[row][4], mintParsed[row][3]);
				if (!mintIdx[hash.one]) {
					mintIdx[hash.one] = {};
				}
				if (!mintIdx[hash.one][hash.two]) {
					mintIdx[hash.one][hash.two] = {};
				}
				if (!mintIdx[hash.one][hash.two][hash.three]) {
					mintIdx[hash.one][hash.two][hash.three] = [];
				}
				
				mintIdx[hash.one][hash.two][hash.three].push(mintParsed[row]);
				//console.log(hash);
			}

			//console.log('**** MISSING TRANSACTION(S) FOR "' + acct + '": ***')
			for (var row = 1; row < bankParsed.length; row++) {
				//var amount = bankParsed[row][4];
				var hash = getHashCode(bankParsed[row][1], bankParsed[row][3], bankParsed[row][4]);
				//bankParsed[row][hash] = hash;
				//console.log(hash);
				if (!mintIdx[hash.one] || !mintIdx[hash.one][hash.two] || !mintIdx[hash.one][hash.two][hash.three]) {
					if (!results[acct]) {
						results[acct] = [];
					}
					results[acct].push(bankParsed[row]);
					//console.log(mintParsed[row]);
				}
				else {
					if (mintIdx[hash.one][hash.two][hash.three].length > 1) {
						console.log('possible dupe? count: ' + mintIdx[hash.one][hash.two][hash.three].length + ' ' + acct + '_' + new Date(hash.one).toString() + '_' + hash.two + '_' + hash.three);
					}
				}
			}
			if (results[acct]) {
				fs.writeFile('results_' + acct + '.txt', JSON.stringify(results[acct], null, 4));
			}
		});
	});
});

function getHashCode(date, type, amount) {
	//var amt = round10(Math.abs(parseFloat(amount)), -2);
	//var t = type.toLowerCase() === 'check' ? 'debit' : type.toLowerCase();
	//var hash = new Date(date).valueOf() + '_' + t + '_' + amt;
	//if (!hash) {console.log('issue with HASH algorithm!')};
	return {
		one: new Date(date).valueOf(),
		two: type.toLowerCase() === 'check' ? 'debit' : type.toLowerCase(),
		three: round10(Math.abs(parseFloat(amount)), -2)
	};
}

//console.log('program ended!');