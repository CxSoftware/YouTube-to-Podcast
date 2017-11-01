// Runtime
import 'babel-polyfill';
import './util/log';

// Dependencies
import winston from 'winston';

// Local
import config from './util/config';
import Aws from './util/aws';
import Podcast from './util/podcast';
import YouTube from './util/youtube';

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

		// List files in bucket
		const bucketFiles = await aws.list ();

		// Upload new files
		const itemsToUpload = items.filter (x => !bucketFiles.includes (x.filename));
		for (const item of itemsToUpload)
		{
			winston.info ('Downloading', item.title, item.filename);
			const video = await youtube.downloadVideo (item.id);
			winston.info ('Uploading');
			await aws.upload (video.stream, item.filename, video.size);
		}

		// Add items
		winston.info ('Adding items');
		await Promise.all (items.map (async (item) =>
		{
			// Get info
			const length = await aws.getLength (item.filename);

			// Add to feed
			winston.info ('Adding to feed', item.title);
			podcast.addItem (
				item.title,
				item.description,
				aws.getUrl (item.filename),
				item.date,
				item.duration,
				item.filename,
				length);
		}));

		// Upload
		winston.info ('Uploading feed');
		const xml = podcast.generate ();
		await aws.upload (xml, config.podcast.xml);

		// Cleanup
		const uploadedFiles = items.map (x => x.filename);
		const filesToDelete = bucketFiles
			.filter (x => x.endsWith ('.aac'))
			.filter (x => !uploadedFiles.includes (x));
		if (filesToDelete.length)
		{
			winston.info ('Deleting files', filesToDelete);
			await aws.deleteFiles (filesToDelete);
		}
	}
	catch (e)
	{
		winston.error (e.message, e.stack);
	}
})();
