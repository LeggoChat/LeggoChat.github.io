Notification.requestPermission();
var currentChn = 'general';
if(typeof(localStorage.getItem('last_channel')) !== "undefined" && localStorage.getItem('last_channel') !== null){
    currentChn = localStorage.getItem('last_channel');
    window.location.href = "#" + currentChn;
}

var currentPage = 0;
var linkChn = window.location.hash.substr(1);
if (linkChn !== '') {
    currentChn = linkChn;
    localStorage.setItem('last_channel', currentChn);
}
// document.getElementById('channel').value = currentChn;
var currentChnText = currentChn;
if(currentChn.length > 15){
    currentChnText = currentChn.substring(0,12)+"..."
}
document.getElementById('title').innerHTML = "#" + currentChnText;
currentChn = '#'+currentChn;
//$('#connecting').modal('show');
// log("Joined " + currentChn);
log({from: "notice", message: "Connecting... Please wait."});

var socket = io.connect('https://leggochat.hexabyn.com');
socket.on('status', function (data) {
    document.getElementById('message').disabled = false;
    document.getElementById("sendBtn").disabled = false;
    if(currentPage > 0){
        document.getElementById('log').innerHTML = "";
        currentPage = 0;
        log({ from: "notice", message: "Reconnected Successfully." });
    }else{
        log(data);
    }
    $('#connecting').modal('hide');
    socket.emit('client', { channel: currentChn });
});

socket.on(currentChn, function (data) {
    log(data);
});

socket.on('disconnect', function (data) {
    //log(data);
    log({ from: "notice", message: "Disconnected!" });
    document.getElementById('message').disabled = true;
    document.getElementById("sendBtn").disabled = true;
});

socket.on('messages', function (data) {
    prelog(data);
});

socket.on("server", function (data) {
    if(data.for == "claim"){
        if(data.message == 1)
            log({from: "notice", message: "Room successfully claimed."});
        else
            log({from: "notice", message: "Room claim unsuccessful. Please try again."});
    }else if(data.for == "allow_messages"){
        socket.emit('messages', { channel: currentChn, page: currentPage });
    }else if(data.for == "auth"){
        $('#change-pwd-btn').removeClass('d-none');
        $('#change-pwd-btn').addClass('d-inline');
        $('#claim-chn-btn').removeClass('d-inline');
        $('#claim-chn-btn').addClass('d-none');
        $('#auth-modal').modal('show');
    }else if(data.for == "changed_password"){
        window.location.reload();
    }else if(data.for == "auth_success"){
        $('#auth-modal').modal('hide');
    }
    else if(data.for == "auth_failure"){
        document.getElementById('authpassword').value = "";
        $('#auth-fail-error').show();
    }else if(data.for == "reclaim"){
        if(data.message == true){
            window.location.reload();
        }else{
            $('#reclaim-failed').show();
        }
    }
});

function send() {
    if(document.getElementById('message').value.replace(/\s/g, "") == ''){
        document.getElementById('message').value = "";
        return false;
    }
    socket.emit('trigger', { channel: currentChn, persist: document.getElementById('persist').checked, message: document.getElementById('message').value });
    // log("Me: " + document.getElementById('message').value);
    log({from: "Me", message: document.getElementById('message').value});
    document.getElementById('message').value = "";
}

function authenticate(){
    socket.emit('client', { channel: currentChn, password: document.getElementById('authpassword').value });
    document.getElementById('authpassword').value = "";
}

function changePassword(){
    socket.emit('server', { mode: "change_password", channel: currentChn, oldpassword: document.getElementById('change-old-password').value, newpassword: document.getElementById('change-new-password').value });
    document.getElementById('change-new-password').value = "";
    document.getElementById('change-old-password').value = "";
    $('#change-pwd-modal').modal('hide');
}

function claim(){
    socket.emit('server', { mode: "claim", channel: currentChn, password: document.getElementById('claimpassword').value });
    $('#claim-modal').modal('hide');
}

function join() {
    window.location.href = "/chat#" + document.getElementById('chgchannel').value;
    $('#exampleModal').modal('hide');
    $('#chgingChn').modal('show');
    localStorage.setItem('last_channel', document.getElementById('chgchannel').value);
    setTimeout(function(){
        location.reload();
    },1500)
}

function prelog(data){
    currentPage++;
    // data = JSON.parse(data);
    data = JSON.parse(data.message);
    var html = "";
    html += `<div id="load-more" class="container text-center"><button onclick="loadMessages();" class="btn btn-link">Load More</button></div>`;

    for(var i=data.length-1; i>=0; i--){
        html += `
                <div class="container">
                    <div class="row">
                        <div class="card bg-danger col-12 col-sm-6">
                            <div class="card-body">
                                <h4 class="card-title">
                                    <span>${data[i].message}</span>
                                </h4>
                                <div class="card-stats">
                                    <div class="author">
                                        <span>${data[i].name}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-sm-6 d-none d-sm-block">
                            &nbsp;
                        </div>
                    </div>
                </div>
            `;
    }
    if(currentPage > 1){
        var elem = document.querySelector('#load-more');
        elem.parentNode.removeChild(elem);
    }
    document.getElementById('log').innerHTML = html+document.getElementById('log').innerHTML;

    if(currentPage == 1){
        var objDiv = document.getElementsByTagName("BODY")[0];
        objDiv.scrollTop = objDiv.scrollHeight;

        window.scrollTo(0,document.body.scrollHeight);
    }
}

function loadMessages(){
    socket.emit('messages', { channel: currentChn, page: currentPage });
}

function log(msg) {
    var notify = false;
    if(typeof(msg) == "undefined" || msg == null || typeof(msg.message) == "undefined"){
        return false;
    }
    // document.getElementById('log').innerHTML += "</br>" + JSON.stringify(msg);

    if(msg.from == "notice"){
        var html = `
            <blockquote class="blockquote text-right">
                <p class="mb-0">${msg.message}</p>
            </blockquote>
        `;
    }else if(msg.from == "count"){
        document.getElementById('count').innerHTML = msg.message;
    }else{
        var persistStr = ""
        if(msg.from == "Me"){
            if(document.getElementById('persist').checked){
                persistStr = " - Persisted";
            }
            var html = `
                <div class="container"><div class="row">
                    <div class="col-sm-6 d-none d-sm-block">
                        &nbsp;
                    </div>
                    <div class="card bg-dark col-12 col-sm-6">
                        <div class="card-body">
                            <h4 class="card-title">
                                <span>${msg.message}</span>
                            </h4>

                            <div class="card-stats">
                                <div class="author">
                                    <span>${msg.from} ${persistStr}</span>
                                </div>
                            </div>
                    </div>
                </div></div>
            `;
        }else{
            notify = true;
            if(msg.persist == 1 || msg.persist == true || msg.persist == "true"){
                persistStr = " - Persisted";
            }
            var html = `
                <div class="container"><div class="row">
                    <div class="card bg-info col-12 col-sm-6">
                        <div class="card-body">
                            <h4 class="card-title">
                                <span>${msg.message}</span>
                            </h4>

                            <div class="card-stats">
                                <div class="author">
                                    <span>${msg.from} ${persistStr}</span>
                                </div>
                            </div>
                    </div>
                    <div class="col-sm-6 d-none d-sm-block">
                        &nbsp;
                    </div>
                </div></div>
            `;
        }
        
    }

    if(typeof(html) !== "undefined"){
        document.getElementById('log').innerHTML += html;
        var objDiv = document.getElementsByTagName("BODY")[0];
        objDiv.scrollTop = objDiv.scrollHeight;

        window.scrollTo(0,document.body.scrollHeight);
    }
    if(notify){
        notify(msg.message);
    }
}

function notify(message) {
    // Let's check if the browser supports notifications
    if (!("Notification" in window)) {
      alert("This browser does not support system notifications");
    }
  
    // Let's check whether notification permissions have already been granted
    else if (Notification.permission === "granted") {
      // If it's okay let's create a notification
      var notification = new Notification(message);
    }
  
    // Otherwise, we need to ask the user for permission
    else if (Notification.permission !== 'denied') {
      Notification.requestPermission(function (permission) {
        // If the user accepts, let's create a notification
        if (permission === "granted") {
          var notification = new Notification(message);
        }
      });
    }

    setTimeout(notification.close.bind(notification), 4000);
  
    // Finally, if the user has denied notifications and you 
    // want to be respectful there is no need to bother them any more.
}

function reclaim(mode){
    if(mode){
        // to public
        socket.emit('server', { mode: "reclaim_public", channel: currentChn });
    }else{
        if($('#authpassword').val() == "")
            $('#reclaim-no-password').show();

        socket.emit('server', { mode: "reclaim_private", channel: currentChn, password: $('#authpassword').val() });
    }
}

var input = document.getElementById("message");

input.addEventListener("keyup", function (event) {
    // Cancel the default action, if needed
    event.preventDefault();
    // Number 13 is the "Enter" key on the keyboard
    if (event.keyCode === 13) {
        // Trigger the button element with a click
        document.getElementById("sendBtn").click();
    }
});

$('.nav-link').on('click',function() {
    $('#toggle-nav').click();
});

$( document ).ready(function() {
    $('#log').css("margin-bottom",$('.send').height()+"px");
});