const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;
const fetch = require('node-fetch');

const teamUsers = ['devongovett', 'fathyb'];
const colors = ['#81d2e0', '#49c4a1'];

function fetchUrl(user) {
	return `https://api.github.com/search/issues?q=+author:${user}+is:open+type:pr`;
}

function createResponse(data) {
	const resp = {
		response_type: 'in_channel',
		text: 'Open PRs',
		attachments: []
	};
	data.forEach((prs, i) => {
		resp.attachments.push({
			color: colors[i],
			pretext: teamUsers[i],
			fields: prs.items.map(item => {
				return {
					value: item.html_url,
					short: false,
				}
			}),
		});
	});
	return resp;
}

express()
  .post('/', (req, res) => {
		Promise.all(teamUsers.map(user => fetch(fetchUrl(user))))
		  .then((arr) => {
				return Promise.all(arr.map(resp => resp.json()));
			})
			.then(data => {
				res.setHeader('Content-Type', 'application/json');
				res.send(JSON.stringify(createResponse(data)));
			});
	})
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
