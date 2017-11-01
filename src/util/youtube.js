// Dependencies
const bluebird = require ('bluebird');
const moment = require ('moment');
const promiseLimit = require ('promise-limit');
const winston = require ('winston');
const youtubedl = require ('youtube-dl');
const YouTubeNode = require ('youtube-node');

// Local
import config from './config';
import sleep from './sleep';

export default class YouTube
{
	constructor ()
	{
		this.config = config.youtube;
		this.youTube = bluebird.promisifyAll (new YouTubeNode ());
		this.youTube.setKey (this.config.key);
		this.limit =  promiseLimit (this.config.limit);
	}

	async downloadVideo (id)
	{
		const stream = youtubedl (id,
			this.config.download.options,
			this.config.download.execOptions);
		let size = null;
		stream.on ('info', info => { size = info.size; });
		winston.debug ('Waiting for download to start...');
		while (size === null)
			await sleep (100);

		// Done
		return { stream, size };
	}

	async getVideoList ()
	{
		const result = await this.youTube.searchAsync (
			'', this.config.count,
			{
				channelId: this.config.channel,
				order: this.config.order
			});

		const regex = this.config.regex ?
			new RegExp (this.config.regex) :
			null;

		const items = result
			.items
			.filter (item => item.id.kind == 'youtube#video')
			.filter (item => regex == null || regex.test (item.snippet.title))
			.map (item => ({
				etag: item.etag,
				title: item.snippet.title,
				id: item.id.videoId,
				description: item.snippet.description
			}));

		const items2 = await Promise.all (items.map (item =>
			this.limit (() => this.getDetails (item))));

		return items2.filter (x => x);
	}

	async getDetails (item)
	{
		winston.debug ('Getting details for', item.id);
		const details = await this.youTube.getByIdAsync (item.id);
		const durationString = details.items [0].contentDetails.duration;
		const duration = moment
			.duration (durationString)
			.as ('seconds');
		if (duration < this.config.minDuration)
			return null;

		item.duration = duration;
		item.date = details.items [0].snippet.publishedAt;
		item.filename = `${item.id}.aac`;
		return item;
	}
}
