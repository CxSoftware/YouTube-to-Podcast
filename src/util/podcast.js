// Dependencies
const _ = require ('lodash');
const mime = require ('mime-types');
const PodcastModule = require ('podcast');

// Local
import config from './config';

export default class Podcast
{
	constructor ()
	{
		this.config = config.podcast;
		this.config.feed.pubDate = new Date ();
		this.feed = new PodcastModule (this.config.feed);
	}

	addItem (title, description, url, date, duration, filename, size)
	{
		const item = _.extend (
			this.config.item,
			{
				title: title,
				description: description,
				url: url,
				date: date,
				itunesSummary: description,
				itunesDuration: duration,
				itunesSubtitle: title,
				enclosure: {
					url: url,
					size: size,
					mime: mime.lookup (filename)
				}
			});
		this.feed.item (item);
	}

	generate ()
	{
		return this.feed.xml ();
	}
}
