// Runtime
require ('babel-polyfill');
require ('./util/log');

// Dependencies
const winston = require ('winston');

// Local
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
		let uploaded = 0;

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
				uploaded++;
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

		// Generate?
		if (!uploaded)
		{
			winston.info ('No files uploaded. Not updating feed.');
			// return;
		}

		// Upload
		winston.info ('Uploading feed');
		aws.upload (podcast.generate (), 'feed.xml');
	}
	catch (e)
	{
		winston.log ('error', e);
	}
})();
