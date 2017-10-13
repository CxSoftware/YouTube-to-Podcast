// Dependencies
const bluebird = require ('bluebird');
const moment = require ('moment');
const winston = require ('winston');
const youtubedl = require ('youtube-dl');
const YouTubeNode = require ('youtube-node');

// Local
const config = require ('./config');
const sleep = require ('./sleep');

export class YouTube
{
	constructor ()
	{
		this.config = config.youtube;
		this.youTube = bluebird.promisifyAll (new YouTubeNode ());
		this.youTube.setKey (this.config.key);
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
		const items = result
			.items
			.filter (item => item.id.kind == 'youtube#video')
			.filter (item => item.snippet.title.includes (this.config.includes))
			.map (item => ({
				etag: item.etag,
				title: item.snippet.title,
				id: item.id.videoId,
				description: item.snippet.description
			}));

		const items2 = await Promise.all (items.map (async (item) =>
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
		}));

		return items2.filter (x => x);
	}
}
