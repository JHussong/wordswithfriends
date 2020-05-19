const socket = io();

//Elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');

//Options
const { username, room } = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoScroll = () => {
    //New message element
    const $newMessage = $messages.lastElementChild;

    //Height of new message
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;
    
    //Messages visible height
    const visibleHeight = $messages.offsetHeight;

    //Messages container height
    const containerHeight = $messages.scrollHeight;

    //Scroll length
    const scrollOffset = $messages.scrollTop + visibleHeight;
    
    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

socket.on('message', (message) => {
    console.log(message)

    const html = Mustache.render(messageTemplate, {
        username: message.username.charAt([0]).toUpperCase() + message.username.slice(1),
        message: message.text,
        createdAt: moment(message.createdAt).format('LLL')
    });
    $messages.insertAdjacentHTML('beforeend', html)

    autoScroll()
});

socket.on('locationMessage', (message) => {
    console.log(message);
    const html = Mustache.render(locationMessageTemplate, {
        username: message.username.charAt([0]).toUpperCase() + message.username.slice(1),
        url: message.url,
        createdAt: moment(message.createdAt).format('LLL')
    });
    $messages.insertAdjacentHTML('beforeend', html)

    autoScroll()
});

socket.on('roomData', ({room, users}) => {
   const html = Mustache.render(sidebarTemplate, {
       room,
       users
   })
   document.querySelector('#sidebar').innerHTML = html
});

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    //Disable form button after submit
    $messageFormButton.setAttribute('disabled', 'disabled');


    const message = e.target.elements.message.value

    socket.emit('sendMessage', message, (message) => {
        //Re-enable the form button, clear message box, focus on input
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = '';
        $messageFormInput.focus();

        console.log('message was delivered!', message)
    });
});

$sendLocationButton.addEventListener('click', ()=> {
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser');
    }

    $sendLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        //console.log(position)

        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            $sendLocationButton.removeAttribute('disabled');
            console.log('Location Shared!')
        })
    });
});

socket.emit('join', { username, room }, (error) => {
    if(error){
        alert(error)
        location.href = '/'
    }
})