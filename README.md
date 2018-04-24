# Micro App Demo

This is a simple Micro App to desmonstrate how to integrate Fred Builder and Micro Apps. 

<p align="center">
  <img src="/public/micro-app-flow.png" width="700"/>
</p>


## Query string parameters

Fred uses the query string to send data to a micro-app. Those are the parameters Fred will always send to a micro-app to indetify a specific interaction:

- **fred_token:** Is a unique identifier for each time a micro-app is requested. This token has a limited age and after its expires that micro-app won't be able to send data back to Fred.
- **connector:** It references which platform is being used by Fred. For example, if the user is interacting over Facebook Messenger, the value of connector would be: "messenger".
- **direct_ids:** This value contaings many informations about the interaction, such as channel_id and user_id. This value uses base64 enconding. It will be used to restore the flow in case the token provided is invalid.
- **fallback:** This parameter is sent to indicate if a fallback URL was provided. In practice when `fallback=1` it means the user is on Desktop so its possible to use this information to design the app behavior.

**Note:** The parameters listed above are necessary to ensure the communication between Fred and the micro-app. Any other data can be sent trough the query string, such as attribute values.

## Sending data back to Fred

All the parameters above has to be sent back to Fred when the micro-app has finished its job. This can be done trough a POST request to the Fred Webhook passing the data into the requistion body. The body object must contain the fred_token, the connector and the direct_ids. Every other data has to be inside the key attributes.

This request can return any of those codes:

- `200`: The request succeeded the app can be closed.
- `422`: The token or the direct_ids provided is invalid, the app must be closed and restarted (if appliable).

This code handles grabbing the parameters from the query string and submiting the data back to Fred:


```javascript
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

```

## Closing the App

If the micro-app was opened in a mobile device, its means the app can be closed automtically. Otherwise the app has to be closed manually by the user. Is important to treat this properly.
The query string parameter `fallback` can be used to determine the device. If `fallback=1` the device is a desktop, any other value is a mobile device. 

```javascript
handleFinishApp = () => {
  const fallback = getParameterByName("fallback") || undefined;
  if (fallback) {
    // if a "fallback=1" is provided it means the user is on a desktop
    // so the app has to be closed manually
  } else {
    // if the "fallback=1" isn't provided the user is accessing from a mobile device
    // to we can call the Messenger Extension API to close the application
    onCloseApp();
  } 
}

const onCloseApp = () => {
    window.MessengerExtensions.requestCloseBrowser(function success() {
        //it worked, no action is neceessary since the app will be closed
    },
    function error(err) {
        //the app failed to be closed
        console.log('App could not be finished. Please Try again.');
    });
};
  
 
```

When in mobile, in order to close the app automatically is necessary to insert the messenger extension to the `index.html:`

```html
<script>
    (function(d, s, id){
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) {return;}
      js = d.createElement(s); js.id = id;
      js.src = "//connect.facebook.com/en_US/messenger.Extensions.js";
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'Messenger'));
</script>
```
