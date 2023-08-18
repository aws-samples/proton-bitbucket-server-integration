/*! Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: MIT-0
 */

'use strict'

const AWS = require('aws-sdk')
const stream = require('stream');
const { inspectArchive } = require('./inspectArchive');

AWS.config.region = process.env.AWS_REGION 
const s3 = new AWS.S3()

// converts a readable stream to a buffer
async function toBuffer(readableStream) {
  const chunks = []
  for await (let chunk of readableStream) {
    chunks.push(chunk)
  }
  return Buffer.concat(chunks);
}

async function getMatches(s3objectVersion) {
  if(!s3objectVersion) return [];
  // get the s3 object
  const s3Object = await s3.getObject({ Bucket: s3objectVersion.BucketName, Key: s3objectVersion.Key, VersionId: s3objectVersion.VersionId }).promise()
  // convert to buffer from the s3 bytes stream
  let objectBuffer = await toBuffer(AWS.util.buffer.toStream(s3Object.Body));
  // inspect the gzip tarball
  let objectVersionMatches = await inspectArchive(objectBuffer);
  return objectVersionMatches;
  
}

// inspect the archive of both objects to compare their directory structures
const compareS3 = async (oldVersion, newVersion) => {
  try {
    console.log ({oldVersion, newVersion})
    
    let oldMatches = await getMatches(oldVersion);
    let newMatches = await getMatches(newVersion);
    
    // not necessary but will sort v1, v2, etc
    oldMatches.sort();
    newMatches.sort();
    let higestversion = await newMatches[newMatches.length-1];
    let hversion = higestversion.replace(/^\D+|\/$/g, ''); // Replace all leading non-digits with nothing
    
    
    console.log({ oldMatches, newMatches });
    console.log(higestversion);
    console.log(hversion);

    return [oldMatches.join(',') === newMatches.join(','), hversion];

  } catch (err) {
    console.error('compareS3: ', err)
  }
}

module.exports = { compareS3 }
