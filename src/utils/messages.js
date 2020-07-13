//file where we can define few functions that is going to generate message objects

const generateMessage = (username,text) =>{
    return {
        username,
        text,
        createdAt : new Date().getTime()
        //this will give 1594457450985 as output so we will use library to format it
    }
}

const generateLocationMessage = (username, url)=>{
    return{
        username,
        url,
        createdAt : new Date().getTime()
    }
}


module.exports = {
    generateMessage,
    generateLocationMessage
}