# YouTube-to-Podcast
Convert YouTube videos into a Podcast feed with audio files

This project fetches videos from YouTube using the YouTube API and youtube-dl. Then, it generates a podcast XML feed file
and upload this feed file and audio files to AWS S3 or other compatible service (like Digital Ocean Spaces.

## Setup
### Install dependencies

Run: `npm install`

### Compile

Run: `gulp`

You will need gulp to be installed (`sudo npm install -g gulp`)

### Setup configuration file

Copy the template file: `cp config.template.json config.json`

Edit the config file config.json
