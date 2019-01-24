let deferredPrompt;

window.addEventListener('appinstalled', (evt) => {
    global.appInstalled = true;
});

window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later.
    deferredPrompt = e;
    // Update UI notify the user they can add to home screen
    if (!global.appInstalled) {
        $('#pwa-prompt').show();
    }
});

btnAdd = document.getElementById('pwa-add');
btnAdd.addEventListener('click', (e) => {
    // hide our user interface that shows our A2HS button
    $('#pwa-prompt').hide();
    // Show the prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice
        .then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the A2HS prompt');
            } else {
                console.log('User dismissed the A2HS prompt');
            }
            deferredPrompt = null;
        });
});
// $('#pwa-modal').modal(show);


if ('serviceWorker' in navigator) {
    console.log("Will the service worker register?");
    navigator.serviceWorker.register('service-worker.js', {
        scope: '.' // <--- THIS BIT IS REQUIRED
    }).then(function (reg) {
            console.log("Yes, it did.");
        }).catch(function (err) {
            console.log("No it didn't. This happened: ", err)
        });
}

this.addEventListener('fetch', function (event) {
    // it can be empty if you just want to get rid of that error
});
