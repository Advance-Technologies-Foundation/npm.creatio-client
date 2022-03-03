# creatio-sdk-client

Simple sdk client for creatio

## Get started

```
npm install --save @screatio/creatio-sdk-client
```

```
const appUrl = 'https://myapp.creatio.com';
const login = 'login';
const password = 'password'; 
const client = require('@screatio/creatio-sdk-client');
client
    .login(appUrl, login, password) // login to application
    .then(() => {
        // call service 'NotificationInfoService' with method 'GetCounters' 
        client.post('NotificationInfoService', 'GetCounters')
            .then(res => console.log(res.data))
    })
```

### npm publish

```
npm login
npm version patch -m "patch comment"
npm publish --access=public
```