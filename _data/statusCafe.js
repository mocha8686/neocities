import Fetch from '@11ty/eleventy-fetch';
import dayjs from 'dayjs';
import utcPlugin from 'dayjs/plugin/utc.js'

dayjs.extend(utcPlugin);

export default async function getData() {
	const url = 'https://status.cafe/users/mocha8686/status.json';

	try {
		const res = await Fetch(url, {
			duration: '1d',
			type: 'json',
		});

		const [value, unit] = res.timeAgo.split(' ');
		const now = dayjs.utc();
		now.subtract(value, unit);
		res.timestamp = now.toISOString();

		return res;
	} catch (e) {
		console.error(e);
		const res = {
			author: 'mocha8686',
			content: 'i hate fire drills!!!! 🤬🤬🤬🤬🤬',
			face: '😡',
			timeAgo: '2 days ago',
		};

		const [value, unit] = res.timeAgo.split(' ');
		const now = dayjs.utc();
		now.subtract(value, unit);
		res.timestamp = now.toISOString();

		return res;
	}
}
