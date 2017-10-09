// Runtime
require ('babel-polyfill');
require ('./util/log');

// Dependencies
const winston = require ('winston');

// Local
const config = require ('./util/config');
import {Aws} from './util/aws';
import {Podcast} from './util/podcast';
import {YouTube} from './util/youtube';

(async () =>
{
	try
	{
		// Init
		winston.info ('Initializing');
		const youtube = new YouTube ();
		const podcast = new Podcast ();
		const aws = new Aws ();

		// Get data from YouTube
		winston.info ('Getting data from channel');
		const items = await youtube.getVideoList ();

		// Add items
		winston.info ('Adding items');
		for (const item of items)
		{
			// Create filename
			const filename = `${item.id}.aac`;

			// Upload if it doesn't exists in S3
			if (!(await aws.fileExists (filename)))
			{
				winston.info ('Downloading', item.title, filename);
				const stream = await youtube.downloadVideo (item.id);
				winston.info ('Uploading');
				await aws.upload (stream, filename);
			}

			// Get info
			const length = await aws.getLength (filename);

			// Add to feed
			winston.info ('Adding to feed', item.title);
			podcast.addItem (
				item.title,
				item.description,
				aws.getUrl (filename),
				item.date,
				item.duration,
				filename,
				length);
		}

		// Upload
		winston.info ('Uploading feed');
		const xml = podcast.generate ();
		await aws.upload (xml, config.podcast.xml);
	}
	catch (e)
	{
		winston.error (e.message, e.stack);
	}
})();
