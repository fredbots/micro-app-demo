import request from 'superagent';
import { getParameterByName } from './utils';

const FRED_HOOK_URL = "https://connectors.staging1.fredapi.net/microapp/v1/continue"

export const onSubmit = (attributes) => {
    const fredToken = getParameterByName("fred_token") || false;
    const fredConnector = getParameterByName("connector") || false;
    const directIds = getParameterByName("direct_ids") || false;
    const requestBody = {
        attributes,
        fred_token: fredToken,
        connector: fredConnector,
        direct_ids: directIds
    };
    return new Promise((resolve, reject) => {
        if(!fredToken || !fredConnector || !directIds) { 
            /*  
                Reject promise imediately if any of those parameters weren't provided with
                the query string. The app must be closed
            */
            return reject("close");
        }

        request 
            .post(FRED_HOOK_URL)
            .send(requestBody)
            .end((err, res) => {
                if(res) {
                    /*
                        The request worked with a status 200
                    */
                    if(res.status === 200 && res.text)
                        return resolve(res.text);

                    /* 
                        When occurs a 422 error code the app 
                        must be closed, so it needs a special
                        handler
                    */
                    if(res.status === 422) 
                        return reject("close");
                    
                    /* 
                        Other generic errors from the server
                    */
                    if(res.body && res.body.errors)
                        return reject(res.body.errors.detail);

                } else if(err){
                    reject("Server Error");
                    throw err;
                }
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