const chat = document.getElementById("chat");
const msgs = document.getElementById("msgs");

// let's store all current messages here
let allChat = [];

// the interval to poll at in milliseconds
const INTERVAL = 3000;

// a submit listener on the form in the HTML
chat.addEventListener("submit", function (e) {
  e.preventDefault();
  postNewMsg(chat.elements.user.value, chat.elements.text.value);
  chat.elements.text.value = "";
});

async function postNewMsg(user, text) {
  // post to /poll a new message
  if (!user || !text) return
  
  await fetch('/poll', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ user, text }) 
  })
}

async function getNewMsgs() {
  // poll the server
  let messages
  try {
    const res = await fetch('/poll')
    messages = await res.json()
  }
  catch(e) {
    console.log('polling error', e)
  }

  allChat = messages.msg
  render()
}

function render() {
  // as long as allChat is holding all current messages, this will render them
  // into the ui. yes, it's inefficent. yes, it's fine for this example
  const html = allChat.map(({ user, text, time, id }) =>
    template(user, text, time, id)
  );
  msgs.innerHTML = html.join("\n");
}

// given a user and a msg, it returns an HTML string to render to the UI
const template = (user, msg) =>
  `<li class="collection-item"><span class="badge">${user}</span>${msg}</li>`;

let timeToMakeNextRequest = 0
async function rafTime(time) {
  if(timeToMakeNextRequest <= time) {
    await getNewMsgs()
    timeToMakeNextRequest = time + INTERVAL
  }

  requestAnimationFrame(rafTime)
}

requestAnimationFrame(rafTime)

