const fs = require('fs');
const targetPath = './src/environments/environment.ts';

const envConfigFile = `export const environment = {
  production: true,
  firebase: {
    projectId: '${process.env['FIREBASE_PROJECT_ID']}',
    appId: '${process.env['FIREBASE_APP_ID']}',
    storageBucket: '${process.env['FIREBASE_STORAGE_BUCKET']}',
    apiKey: '${process.env['FIREBASE_API_KEY']}',
    authDomain: '${process.env['FIREBASE_AUTH_DOMAIN']}',
    messagingSenderId: '${process.env['FIREBASE_MESSAGING_SENDER_ID']}',
    measurementId: '${process.env['FIREBASE_MEASUREMENT_ID']}'
  }
};
`;

fs.writeFile(targetPath, envConfigFile, function (err: Error | null) {
  if (err) {
    console.log(err);
  }
  console.log(`Output generated at ${targetPath}`);
});
