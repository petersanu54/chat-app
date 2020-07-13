//here we will keep track of user in an array
const users = []

//addUser allwoing us to track a user
//removeUser allows us to stop trackng a user when he leaves
//getUser allows us fetch a user's data
//getUsersInRoom  allows us toget complte list of all user in a particular room

const addUser = ({ id, username, room})=>{
    //clean the data
    username = username.trim().toLowerCase() 
    room = room.trim().toLowerCase()

    //validate the data
    if(!username || !room){
        return {
            error : 'Username and room is required!'
        }
    }

    //check for existing user
    const existingUser = users.find((user)=>{
        return user.room === room && user.username === username
    })

    //vaidate username if already present in room
    if(existingUser){
        return{
            error : 'Username is in use!'
        }
    }

    //store user
    const user = {id, username, room}
    users.push(user)
    return { user }
}

//remove user
const removeUser = (id)=>{
    const index = users.findIndex((user)=> user.id === id)
    if(index != -1){
        return users.splice(index, 1)[0]//splice allows us to remove item from an array buy its index(has to parameter index and number of items we need to remove)[0] will retrun the object that is removed
    }
}

const getUser = (id)=>{
    return users.find((user)=> user.id === id )
}


//thiss gonnna list the users list in the sidebar in the browser
const getUsersInRoom = (room)=> {
    room = room.trim().toLowerCase()
    return users.filter((user)=> user.room === room)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}
// //test


// addUser({
//     id:12,
//     username: 'peter',
//     room:'india'
// })



// addUser({
//     id:19,
//     username: '  parker',
//     room:'USA   '
// })


// addUser({
//     id:25,
//     username: 'jack',
//     room:'india'
// })



// const user = getUser(191)
// console.log(user)

// const userList = getUsersInRoom('hell')
// console.log(userList) 


