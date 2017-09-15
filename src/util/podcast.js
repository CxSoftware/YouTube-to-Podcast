// Dependencies
const mime = require ('mime-types');
const PodcastModule = require ('podcast');

// Local
const config = require ('./config');

export class Podcast
{
	constructor ()
	{
		this.config = config.podcast;
		this.config.feed.pubDate = new Date ();
		this.feed = new PodcastModule (this.config.feed);
	}

	addItem (title, description, url, date, duration, filename, size)
	{
		this.feed.item ({
			title: title,
			description: description,
			url: url,
			date: date,
			itunesSummary: description,
			itunesDuration: duration,
			enclosure: {
				url: url,
				size: size,
				mime: mime.lookup (filename)
			}
		});
	}

	generate ()
	{
		return this.feed.xml ();
	}
}
