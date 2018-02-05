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
		winston.info ('Listing files in bucket');
		const bucketFiles = await aws.list ();

		// Upload new files
		const notDownloaded = [];
		const itemsToUpload = items.filter (x => !bucketFiles.includes (x.filename));
		winston.info (`Found ${itemsToUpload.length} items to upload`);
		for (const item of itemsToUpload)
		{
			try
			{
				winston.info ('Downloading', item.title, item.filename);
				const video = await youtube.downloadVideo (item.id);
				winston.info ('Uploading');
				await aws.upload (video.stream, item.filename, video.size);
			}
			catch (e2)
			{
				winston.info ('Skipping', item.title);
				winston.error (e2);
				notDownloaded.push (item);
			}
		}

		// Remove items
		if (notDownloaded.length)
		{
			winston.info ('Removing items that were not downloaded');
			for (const item of notDownloaded)
			{
				winston.info ('Removing', item.title);
				items.splice (items.indexOf (item), 1);
			}
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
		if (config.aws.deleteOld)
		{
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
	}
	catch (e)
	{
		winston.error (e.message, e.stack);
	}
})();
