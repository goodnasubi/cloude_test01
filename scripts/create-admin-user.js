/**
 * Script to create an admin user for testing
 * This script would be run in the AWS Console or using AWS CLI
 * to assign a user to the admin group
 */

// Example AWS CLI commands to create admin user:
// aws cognito-idp admin-create-user \
//   --user-pool-id YOUR_USER_POOL_ID \
//   --username admin@example.com \
//   --user-attributes Name=email,Value=admin@example.com \
//   --message-action SUPPRESS

// aws cognito-idp admin-add-user-to-group \
//   --user-pool-id YOUR_USER_POOL_ID \
//   --username admin@example.com \
//   --group-name admin

// Or using the AWS SDK:
// const AWS = require('aws-sdk');
// const cognito = new AWS.CognitoIdentityServiceProvider();

// const params = {
//   UserPoolId: 'YOUR_USER_POOL_ID',
//   Username: 'admin@example.com',
//   GroupName: 'admin'
// };

// cognito.adminAddUserToGroup(params, (err, data) => {
//   if (err) console.log(err, err.stack);
//   else console.log('User added to admin group successfully');
// });

console.log('Admin user creation script - run AWS CLI commands above');