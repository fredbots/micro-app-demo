import request from 'superagent';
import { getParameterByName } from './utils';

const FRED_HOOK_URL = "https://connectors.staging1.fredapi.net/microapp/v1/continue"

export const onSubmit = (attributes) => {
    const fredToken = getParameterByName("fred_token") || "thereisnotoken";
    const fredConnector = getParameterByName("connector") || "thereisnoconnector";
    const requestBody = {
        attributes,
        fred_token: fredToken,
        connector: fredConnector
    };
    return new Promise((resolve, reject) => {
        request
            .post(FRED_HOOK_URL)
            .send(requestBody)
            .end((res, err) => {
                if (res && !res.errors)
                    resolve(res);
                else
                    reject(res.errors.detail || err);
            })
    })
}

export const onCloseApp = () => {
        window.MessengerExtensions.requestCloseBrowser(function success() {
            //it worked, no action is neceessary since the app will be closed
        },
        function error(err) {
            //the app failed to be closed
            console.log('App could not be finished. Please Try again.');
        });
};