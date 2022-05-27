const sqlite3 = require('sqlite3').verbose();
// const Swal = require('sweetalert2');
let sql;
// importing dom
const txtfield = document.getElementById('txtfield');
const save = document.getElementById('save');
const edit = document.querySelectorAll('#edit');
const copy = document.querySelectorAll('#copy');
const remove = document.querySelectorAll('#remove');
const bins = document.getElementById('bins');
const username = document.getElementById('username');
const guser = document.getElementById('guser');
const gbtn = document.getElementById('gbtn');
const drop = document.getElementById('drop');
const usersdiv = document.getElementById('users');
const errordiv = document.getElementById('error');

// get user
let users = JSON.parse(localStorage.getItem('users'));

// connect to db

const db = new sqlite3.Database('./bin.db', (err) => {
	if (err) {
		console.error(err.message);
	}
	console.log('Bin created by neeswebservices');
});

// create table

sql = `CREATE TABLE IF NOT EXISTS bin(id INTEGER PRIMARY KEY ,date, content , user)`;

db.run(sql, (err) => {
	if (err) {
		console.error(err.message);
		errordiv.textContent = err.message;
	}
});

// add data to db

save.addEventListener('click', () => {
	let date = new Date().toISOString();
	let content = txtfield.value.trim();
	let mainuser = username.value.trim();
	if (content != '' && mainuser != '') {
		let sql = `INSERT INTO bin(date, content, user) VALUES(?,?,?)`;
		db.run(sql, [date, content, mainuser], (err) => {
			if (err) {
				return console.error(err.message);
			}
			txtfield.value = '';
			let user = {
				date,
				content,
				mainuser,
			};

			let users = JSON.parse(localStorage.getItem('users'));

			if (users == null) {
				let data = [user];
				localStorage.setItem('users', JSON.stringify(data));
			} else {
				users.push(user);
				localStorage.setItem('users', JSON.stringify(users));
			}
			displayUsers();
			getData(user.mainuser);
		});
	} else {
		errordiv.textContent = 'Please enter username and bin content !';
	}
});

// display data

gbtn.onclick = () => {
	getData(guser.value);
};
function getData(username) {
	let user = username ?? guser.value;

	if (user != '') {
		let html = '';
		sql = `SELECT * FROM bin WHERE user = ?`;
		db.all(sql, [user], (err, rows) => {
			if (err) {
				return alert(err.message) && console.error(err.message);
			}
			rows.forEach((row) => {
				html += `
<div class="bin">
<div class="time">
${row.date}
</div>
<pre>
${row.content}
</pre>
<button id="copy" onclick="copyme(event)"  data-btxid=${row.id} class="button is-link is-rounded is-hovered">
Copy
</button>
</div>
`;
			});
			return html == ''
				? (errordiv.textContent = 'enter valid username !')
				: (bins.innerHTML = html);
		});
		displayUsers();
	} else {
		errordiv.textContent = 'Please enter your username !';
		return;
	}
}

copy.forEach((item) => {
	item.addEventListener('click', (e) => {
		console.log(e);
	});
});

drop.addEventListener('click', () => {
	if (guser.value != '') {
		let sql2 = `SELECT * FROM bin WHERE user = ?`;
		db.all(sql2, [guser.value], (err, rows) => {
			if (err) {
				return alert(err.message) && console.error(err.message);
			}
			if (rows.length > 0) {
				txtfield.focus();

				let sql = `DELETE FROM bin WHERE user = ?`;
				db.run(sql, [guser.value], (err) => {
					if (err) {
						console.error(err.message);
						errordiv.textContent = 'Username might be suspectfull !';
					} else {
						guser.value = '';
						bins.innerHTML = '';
						displayUsers();
					}
				});
				txtfield.focus();
				setTimeout(() => {
					guser.focus();
				}, 1000);
			} else {
				errordiv.textContent = 'Username is not valid  !';
			}
		});
	} else {
		errordiv.textContent = 'Whom to delete ? username !';
	}
});

function copyme(e) {
	e = e || window.event;
	let target = e.target || e.srcElement;
	const text = target.previousElementSibling.innerHTML;

	const el = document.createElement('textarea');
	el.value = text;
	document.body.appendChild(el);
	el.select();
	document.execCommand('copy');
	document.body.removeChild(el);
}

function displayUsers() {
	let sql = `SELECT * FROM bin`;
	let html = '';
	db.all(sql, (err, rows) => {
		if (err) return console.log(err);

		if (rows.length >= 0) {
			let newarr = [];

			const unique = [
				...rows
					.reduce((map, obj) => map.set(obj.user, obj), new Map())
					.values(),
			];
			unique.forEach((item) => {
				html += `
					<div class="singleuser">
						<div>Name: ${item.user}</div>
						<div>Created At: ${item.date}</div>
					</div>

					`;
			});

			usersdiv.innerHTML = html;
		} else {
			usersdiv.innerHTML = '';
		}
	});
}

displayUsers();

setInterval(async () => {
	setTimeout(async () => {
		errordiv.textContent = '';
	}, 3000);
}, 5000);

// db.run('DROP TABLE users', (err) => {
// 	if (err) {
// 		console.error(err.message);
// 	}
// 	console.log('Table dropped successfully.');
// });

// insert data

// sql = `INSERT INTO users(username, email) VALUES(?,?)`;

// db.run(sql, ['neeswebservices', 'nees@gmail.com'], (err) => {
// 	if (err) {
// 		return console.log(err.message);
// 	}
// 	console.log('data inserted !');
// });

// get data

// sql = `SELECT * FROM users`;

// db.all(sql, [], (err, rows) => {
// 	if (err) return console.log(err.message);
// 	rows.forEach((row) => {
// 		// users.innerHTML += `${row.username} ${row.email} <br>`;
// 		console.log(row.id + ' ' + row.email);
// 	});
// });
