const creatioClient = require('./creatio-client/creatio-client.js');
const userSettings = require('./user-settings.json');


creatioClient.login(userSettings.applicationUrl, userSettings.userName, userSettings.userPassword)
.then(function () {
    creatioClient.post(userSettings.serviceName, userSettings.methodName, "")
    .then((response) => {
        console.log('response data...')
        console.log(response.data);
    })
})


