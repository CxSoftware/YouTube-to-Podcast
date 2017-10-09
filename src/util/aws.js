// Runtime
require ('babel-polyfill');

// Dependencies
const AWS = require ('aws-sdk');
const mime = require ('mime-types');

// Local
const config = require ('./config');

export class Aws
{
	constructor ()
	{
		this.config = config.aws;
		this.s3 = new AWS.S3 (this.config.s3);
	}

	async fileExists (filename)
	{
		const params = {
			Bucket: this.config.bucket,
			Key: filename
		};
		try
		{
			await this.s3
				.headObject (params)
				.promise ();
			return true;
		}
		catch (e)
		{
			if (e.code === 'NotFound')
				return false;

			throw e;
		}
	}

	async getLength (filename)
	{
		const params = {
			Bucket: this.config.bucket,
			Key: filename
		};
		const data = await this.s3
			.headObject (params)
			.promise ();
		return data.ContentLength;
	}

	getUrl (filename)
	{
		return this.config.baseUrl + filename;
	}

	async upload (body, filename)
	{
		const params = {
			ACL: 'public-read',
			Body: body,
			Bucket: this.config.bucket,
			Key: filename,
			ContentType: mime.lookup (filename)
		};
		await this.s3
			.putObject (params)
			.promise ();
	}
}
