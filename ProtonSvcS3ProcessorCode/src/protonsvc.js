/*! Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: MIT-0
 */

'use strict'

const AWS = require('aws-sdk')
AWS.config.region = process.env.AWS_REGION
const proton = new AWS.Proton()


async function getProtonTemplateName(templateName) {
   let tempTemplateName = templateName.trim();
   console.log(tempTemplateName)
   try {
      const data = await proton.getServiceTemplate({
         name: tempTemplateName
      }).promise();
      console.log(data);

      let datatemplateName = data.serviceTemplate.name;
      console.log(datatemplateName);
      return datatemplateName;
   } catch (error) {
      console.log(error);
      return null;
   }
}

module.exports = { getProtonTemplateName }








