const axios = require("axios");

function getCookieByName(response, name) {
	let cookies = response.headers["set-cookie"] || [];
	let cookie = cookies
		.map((rawCookie) => {
			let nameAndValueArray = rawCookie.split("=");
			let cookieName = nameAndValueArray[0];
			let cookieValue = nameAndValueArray[1];
			return {
				name: cookieName,
				value: cookieValue.split(";")[0]
			};
		})
		.filter((cookie) => {
			return cookie.name === name;
		})[0];
	return cookie && cookie.value;
}

function getCookieString(name, value) {
	return [name, value].join("=");
}

function login(connectionConfig, callback) {
	loginByUser(connectionConfig, undefined, undefined, callback);
}

function loginByUser(connectionConfig, userName, password, callback) {
	axios.defaults.withCredentials = true;
	axios
		.post(connectionConfig.applicationUrl + connectionConfig.authService, {
			UserName: userName || connectionConfig.userName,
			UserPassword: password || connectionConfig.userPassword,
			WorkspaceName: connectionConfig.workspace
		}, {
			headers: {
				'Content-Type': 'application/json'
			}})
		.then((response) => {
			if (response.data.Message === "") {
				callback(response);
			} else {
				throw new Error(response.data.Message);
			}
		}).catch(console.error)
}

function loginWithTotpProvider(connectionConfig, callback) {
	axios.defaults.withCredentials = true;
	axios
		.post(connectionConfig.applicationUrl + connectionConfig.authService, {
			UserName: connectionConfig.userName,
			UserPassword:  connectionConfig.userPassword,
			WorkspaceName: connectionConfig.workspace,
			ProviderName: connectionConfig.authProviderName,
			ClaimList: [{"Key":"token","Value":secret2FACode.totpCode}]
		}, {
			headers: {
				'Content-Type': 'application/json'
			}})
		.then((response) => {
				callback(response);
		}).catch(console.error)
}


async function requestSessionCookieString(appBaseUrl, headersWithcookies) {
	const dumbMethodToGetSession = appBaseUrl + "/0/rest/NotificationInfoService/GetCounters";
	const result = await axios.post(dumbMethodToGetSession, null, headersWithcookies);
	const sessionValue = getCookieByName(result, "BPMSESSIONID");
	return getCookieString("BPMSESSIONID", sessionValue);
}

const secret2FACode = {
	totpCode: ""
}

module.exports = {
	login,
	loginByUser,
	requestSessionCookieString,
	loginWithTotpProvider,
	secret2FACode
};
