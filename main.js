var currentChn = 'general';
var linkChn = window.location.hash.substr(1);
if (linkChn !== '') {
    currentChn = linkChn;
}
// document.getElementById('channel').value = currentChn;
document.getElementById('title').innerHTML = "#" + currentChn;
// log("Joined " + currentChn);

var socket = io.connect('https://leggochat.hexabyn.com');
socket.on('status', function (data) {
    log(data);
    socket.emit('client', { channel: currentChn });
});

socket.on(currentChn, function (data) {
    log(data);
});

socket.on('disconnect', function (data) {
    log(data);
});

function send() {
    socket.emit('trigger', { channel: currentChn, message: document.getElementById('message').value });
    // log("Me: " + document.getElementById('message').value);
    log({from: "Me", message: document.getElementById('message').value});
    document.getElementById('message').value = "";
}

function join() {
    window.location.href = "chat.html/#" + document.getElementById('chgchannel').value;
    //location.reload(true);
}

function log(msg) {
    console.log(msg);
    // document.getElementById('log').innerHTML += "</br>" + JSON.stringify(msg);

    if(msg.from == "notice"){
        var html = `
            <blockquote class="blockquote text-right">
                <p class="mb-0">${msg.message}</p>
            </blockquote>
        `;
    }else{
        if(msg.from == "Me"){
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
                                    <span>${msg.from}</span>
                                </div>
                            </div>
                    </div>
                </div></div>
            `;
        }else{
            var html = `
                <div class="container"><div class="row">
                    <div class="card bg-info col-12 col-sm-6">
                        <div class="card-body">
                            <h4 class="card-title">
                                <span>${msg.message}</span>
                            </h4>

                            <div class="card-stats">
                                <div class="author">
                                    <span>${msg.from}</span>
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

    document.getElementById('log').innerHTML += html;

    var objDiv = document.getElementsByTagName("BODY")[0];
    objDiv.scrollTop = objDiv.scrollHeight;

    window.scrollTo(0,document.body.scrollHeight);

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