const socket = io()

//here $ is just a convection that its is a variable for parsing quickly
const $messageForm = document.querySelector('#form1')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $locationButton = document.querySelector('#send-location')
//this is to get the message in the division
const $messages = document.querySelector('#messages')
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//we already have socket in server(index.js) when a new connection comes in.
//here when client intitalize thee conection we now also get access to socket so that we can have both send and recieve events.

//now lets recieive a event from server
// socket.on('countUpdated', (count)=>{
//     //name countUpdated should match the name in index.js
//     console.log('count has been updated', count)
// })

// document.querySelector('#increment').addEventListener('click', ()=>{
//     console.log('clicked')
//     socket.emit('increment')// sends to server
//     //when someone click the button the increment will increment the number by 1
//     //we need to do same in server to listen
// })


//this to get the template in index.html
const messageTemplate = document.querySelector('#message-template').innerHTML //we will be using innerHTML property to render the template corrrectly
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML

//options
//now er are using the bottom qs.min.js script
//as we know location.search gives us the query string if typed in developers option in browser and this will divide it into 2 proprties i.e. ?username and room
//to remove question marke sign we use ignoreQueryPrefix : true. 
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix : true })


const autoscroll = ()=>{
    //if someone is viewing the chat history then we don't want auto scrolling
    //we only want scrollin when we are at the bottom 
    
    //new messagge element
    const $newMessage = $messages.lastElementChild //here the lastchaildlement will the latest message

    //now we need to figure out what is the px of the margin bottom
    const newMessageStyles = getComputedStyle($newMessage)
    //so when you console this in F2 u will get marginBottom: "16px". now  can use and convert it into a number so that we can use at offsetHeight
    // console.log(newMessageStyles)
    //let convert the px into Int
    const newMessaeMargin = parseInt(newMessageStyles.marginBottom)
    //now we need to get the height of the new message so that we get auto scroll that much
    const newMessageHeight = $newMessage.offsetHeight + newMessaeMargin

    //now we need the visible height which is the amount of total space of the chat window which we can see without scrolling
    const visibleHeight = $messages.offsetHeight

    //now we need to find the container height which is the total space of the chat window which we can see on scrolling. This size will increase as the chat goes on
    const containerHeight = $messages.scrollHeight //the scrollheihgt gives us the totoal height we are able to scoll through
    
    //now we need to find how far down we have actually scolled during chat
    const scrollOffset = $messages.scrollTop + visibleHeight //scroolTop gives us the number the amt of distane we have scrolled from the top

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }

}

socket.on('message',(message)=>{
    //overhere we will render messages
    console.log(message)
    //here the html will be storing the final html going to be rendered in the browser
    //we will use the Mustache lib to get the html 
    const html = Mustache.render(messageTemplate,{
        username : message.username,
        message : message.text,
        createdAt : moment(message.createdAt).format('hh:mm a')  //comes from the index.js {{message}}

    })

    //now we got the html and we want to add the html in div i.e $messages
    $messages.insertAdjacentHTML('beforeend', html)//insertAdjacentHTML allows us to insert other html adjacent to it
    //beforeend will add the new messages at the end of the template and wehave other options too in place of beforeend
    autoscroll()
})

socket.on('locationMessage',(message)=>{
    console.log(message)
    const html = Mustache.render(locationMessageTemplate,{
        username : message.username,
        url:message.url,
        createdAt : moment(message.createdAt).format('hh:mm a')  //comes from the index.js {{message}}
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})


socket.on('roomData', ({room, users})=>{
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    //disable the submit button
    $messageFormButton.setAttribute('disabled','disabled')
    //here we are setting the disabled attribute who values is also disabled

    //const message = document.querySelector('input').value // in case there is another input in htmml that could mess the code so we used e.target
    const message = e.target.elements.message.value // here target is waht we are listening to so here taret with elements property is form
    socket.emit('sendMessage', message, (error)=>{
        
        //enablin the submit button again
        $messageFormButton.removeAttribute('disabled')

        //clearing the text inside after submiting
        $messageFormInput.value = ''
        $messageFormInput.focus()
        if(error){
            return console.log(error)
        }
        console.log('message delivered')
    })// using the third argument as a function to acknowledgement that the client's message has been delivered
    //and in the server i will use a another argument callback to run when my message is delivered to get acknowledged
})

$locationButton.addEventListener('click', ()=>{
    //we are using geo-location to let user share his/her location
    //not every browser supports geolocation // here we will be using naviggator asevrything we need for geolocation lives in navigator

    if(!navigator.geolocation){
        //check if browser supports geolocation
        return alert('Geolocation not supported by your browser')
    }
    //if geolocation is suppported then
    
    $locationButton.setAttribute('disabled','disabled')

    //here getcurrentposition does not supports promises hence we won't be able to use async and await
    navigator.geolocation.getCurrentPosition((position)=>{
        //here position here is the info we want to share
        socket.emit('sendLocation', {
            latitude : position.coords.latitude,
            longitude : position.coords.longitude
        }, (error)=>{

            $locationButton.removeAttribute('disabled')
            if (error){
                return console.log(error)
            }
            console.log('Location has been shared')

        })
    })
})

//we are adding this event for the server to listen
//so here join is going to accept thr username you want to use and the room we are trying to join and in backend it will attempt to get that done
socket.emit('join', {username,room},(error)=>{
    if(error){
        alert(error)
    }
})
//now er are sending the data to server and now its the server's job to setup a listener to join so we will setup a listener in index.js for join