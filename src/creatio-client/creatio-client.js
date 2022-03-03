let connectionConfig = require('./creatio-connection.json');
const loginModule = require('./creatio-login-module.js');
const axios = require('axios');
let post = axios.post;

module.exports = {

	login: function (applicationUrl, userName, userPassword, useSession = true) {
		let config = {
			"applicationUrl": applicationUrl,
			"userName": userName,
			"userPassword": userPassword
		}
		this.applyLoginInfo(config)
		console.log(connectionConfig);
		let getAuthCookie = function (callback) {
			loginModule.login(Object.assign(connectionConfig, {useSession}), function (headersWithcookies) {
				callback(headersWithcookies);
			});
		};
		let applyRequestDefaults = function (headersWithcookies, callback) {
			let cookieHeader, csrf;
			const setCookie = require("set-cookie-parser");
			const cookie = setCookie.parse(headersWithcookies.headers["set-cookie"]);
			cookieHeader = cookie.reduce(
				(accumulator, {name: key, value}) =>
					accumulator + `${key}=${value}; `,
				""
			);
			const csrfCookie = cookie.find(x => x.name === "BPMCSRF");
			csrf = csrfCookie && csrfCookie.value;
			console.log('Set cookies ' + cookieHeader.replace('BPMSESSIONID=; ',''));
			axios.defaults.headers.common["Cookie"] = cookieHeader.replace('BPMSESSIONID=; ','');
			console.log('Set csrf ' + csrf);
			axios.defaults.headers.common["BPMCSRF"] = csrf;
			axios.defaults.validateStatus = false;
			if(useSession){
			loginModule.requestSessionCookieString(connectionConfig.applicationUrl)
				.then(sessionCookieString => {
					axios.defaults.headers.common["Cookie"] += sessionCookieString;
					callback();
				});
			} else {
				callback();
			}
		};
		return new Promise(function (done) {
			for (let [key, value] of Object.entries(axios.defaults.headers.common)) {
				console.log('Delete old headers ' + `${key}: ${value}`);
				delete axios.defaults.headers.common[key];
			}
				getAuthCookie(function (headersWithcookies) {
					applyRequestDefaults(headersWithcookies, function () {
						done(headersWithcookies);
					});
				})
		});
	},

	logout: function () {
		let clearRequestDefaults = function (callback) {
			for (let [key, value] of Object.entries(axios.defaults.headers.common)) {
				console.log('Delete old headers ' + `${key}: ${value}`);
				delete axios.defaults.headers.common[key];
			}
			callback();
		};
		return new Promise(function (done) {
			clearRequestDefaults(function () {
				done();
			})
		})
	},

	applyLoginInfo: function (config) {
		connectionConfig.applicationUrl = config.applicationUrl;
		connectionConfig.userName = config.userName;
		connectionConfig.userPassword = config.userPassword;
	},

	applyLoginInfoSetProvider: function (config) {
		connectionConfig.userName = config.name;
		connectionConfig.userPassword = config.password;
		connectionConfig.authProviderName = config.authProvider;
	},

	post: function(serviceName,methodName, requestData) {
		const serviсeUrl = connectionConfig.applicationUrl + "/0/rest/"+serviceName+"/"+methodName;
		return post(serviсeUrl, requestData)
	}

};
