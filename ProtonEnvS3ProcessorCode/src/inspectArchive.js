/*! Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: MIT-0
 */

'use strict'

const zlib = require("zlib");
const tar = require('tar-stream');

// matches /v[0-9]+/, e.g. /v1/
const VERSION_REGEX = /\/v[\d]+\//g;
const DIRECTORY = "directory";

// pipe the stream to find matches
// this only works for tar.gz right now
async function inspectArchive(inputStream) {
    // only works for tar.gz
    // can use tar or zip if using other formats
    const gunzip = zlib.createGunzip();
    const extract = tar.extract();
    
    return new Promise((resolve, reject) => {
        var matches = [];
        extract.on('entry', function(header, stream, next) {
            // check for unique directory matches on regex
            if (header.type && header.type == DIRECTORY) {
                let matched = header.name.match(VERSION_REGEX);
                if(matched && matched.length > 0) {
                    let matchedValue = matched[0];
                    if(!matches.includes(matchedValue)) {
                        matches.push(matchedValue.trim().toLowerCase());
                    }
                }
            }
            // go to next entry
            stream.on('end', () => {
                next();
            });
            // continue the stream pointer
            stream.resume();
        });
        extract.on('finish', () => {
            // important: this completes the promise
            resolve(matches);
        });
        // stream.pipeline is another alternative here
        gunzip.pipe(extract);
        gunzip.end(inputStream);
    });
}

module.exports = { inspectArchive }
