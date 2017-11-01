// Runtime
import 'babel-polyfill';

// Dependencies
import AWS from 'aws-sdk';
import mime from 'mime-types';

// Local
import config from './config';

export default class Aws
{
	constructor ()
	{
		this.config = config.aws;
		this.s3 = new AWS.S3 (this.config.s3);
	}

	async deleteFiles (files)
	{
		const params = {
			Bucket: this.config.bucket,
			Delete: {
				Objects: files.map (f => ({ Key: f })),
				Quiet: true
			}
		};
		await this.s3
			.deleteObjects (params)
			.promise ();
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

	async list ()
	{
		const result = await this.s3
			.listObjects ({ Bucket: this.config.bucket })
			.promise ();

		return result.Contents.map (x => x.Key);
	}

	async upload (body, filename, size = null)
	{
		const params = {
			ACL: 'public-read',
			Body: body,
			Bucket: this.config.bucket,
			Key: filename,
			ContentLength: size,
			ContentType: mime.lookup (filename)
		};
		await this.s3
			.putObject (params)
			.promise ();
	}
}
