// Dependencies
const bluebird = require ('bluebird');
const fs = require ('fs-promise');
const moment = require ('moment');
const pipe = require ('promisepipe');
const winston = require ('winston');
const youtubedl = require ('youtube-dl');
const YouTubeNode = require ('youtube-node');

// Local
const config = require ('./config');

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
		const filePath = `/tmp/${id}.m4a`;
		const video = youtubedl (id,
			this.config.download.options,
			this.config.download.execOptions);
		winston.debug ('Waiting for download');
		await pipe (
			video,
			await fs.createWriteStream (filePath));
		winston.debug ('Downloaded');
		const stream = await fs.createReadStream (filePath);
		return stream;
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

		for (const item of items)
		{
			winston.debug ('Getting details for', item.id);
			const details = await this.youTube.getByIdAsync (item.id);
			const durationString = details.items [0].contentDetails.duration;
			const duration = moment.duration (durationString);
			item.duration = duration.as ('seconds');
			item.date = details.items [0].snippet.publishedAt;
		}

		return items.filter (x => x.duration > this.config.minDuration);
	}
}
