# Micro-App Demo

This is a simple Micro-App example to demonstrate the main steps needed to integrate a Fred bot with Micro-Apps. 

<p align="center">
  <img src="/public/micro-app-flow.png" width="700"/>
</p>


## Query String Parameters

Fred uses the query string to send data to a micro-app. Those are the parameters Fred will always send to a micro-app through the query string to indetify a specific interaction:

- **fred_token:** A unique identifier for each time a micro-app is requested. This token has limited age and after it expires, the micro-app won't be able to send data back to Fred.
- **connector:** Identifies which chat platform is being used by the user that originated the micro-app call. For example, if the user is interacting over Facebook Messenger, the value of `connector` will be "messenger".
- **direct_ids:** This value contains routing information about the interaction, such as Fred `channel_id` and `user_id`. It will is used to restore the flow in case the token provided is invalid.
- **fallback:** In practice when `fallback=1` it means the user is on Desktop so its possible to use this information to design the app behavior. In the case of Messenger, if the user is on Desktop, the micro-app is responsible to closing the webview overlay.

**Note:** The parameters listed above are required to ensure communication between Fred and the Micro-App. Any other data can be sent trough the query string, such as attribute values.

## Sending Data Back to Fred

All parameters above have to be sent back to Fred when the micro-app has finished its job. This can be done trough a POST request to Fred passing the data into the request body. The body object must contain the `fred_token`, the `connector` and the `direct_ids` properties. Any additional data may be provided inside the `attributes` property (you can set any amount of arbitrary attributes).

Expect the following response codes:

- `200`: The request succeeded the micro-app can be closed.
- `422`: The properties `token` or `direct_ids` are invalid, the micro-app must be closed and restarted (if applicable).

The following code handles grabbing the parameters from the query string and submiting the data back to Fred:


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
                Reject promise immediately if any of those parameters weren't provided with
                the query string. The app must be closed.
            */
            return reject("close");
        }

        request 
            .post(FRED_HOOK_URL)
            .send(requestBody)
            .end((err, res) => {
                if(res) {
                    /*
                        The request worked with status 200
                    */
                    if(res.status === 200 && res.text)
                        return resolve(res.text);

                    /* 
                        When 422 error code occurs, the app 
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

If the micro-app is opened in a mobile device, the originating webview can be closed automtically. Otherwise the webview has to be closed manually by the user. It is important to treat this properly.

The query string parameter `fallback` can be used to determine the device. If `fallback=1` the device is a desktop computer, any other value is a mobile device. 

```javascript
handleFinishApp = () => {
  const fallback = getParameterByName("fallback") || undefined;
  if (fallback) {
    // If "fallback=1" is provided it means the user is on desktop
    // so the app has to be closed manually.
  } else {
    // If "fallback=1" isn't provided the user is accessing from a mobile device
    // so we can call the Messenger Extension API to close the application.
    onCloseApp();
  } 
}

const onCloseApp = () => {
    window.MessengerExtensions.requestCloseBrowser(function success() {
        // It worked, no action is neceessary since the app will be closed.
    },
    function error(err) {
        //the app failed to be closed
        console.log('App could not be finished. Please try again.');
    });
};
  
 
```

When in mobile, in order to close the app automatically it is necessary to insert the Messenger Extensions SDK into the micro-app:

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
