const users = []

//Add User
const addUser = ({ id, username, room }) => {
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //Validation of data
    if (!username || !room) {
        return{
            error: 'Username and Room are required!'
        }
    }

    //Check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    //Check username
    if(existingUser) {
        return {
            error: "Username already in use! Try another name."
        }
    }

    //Storing the users
    const user = { id, username, room }
    users.push(user)
    return { user }
}

//Remove User
const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)

    if(index !== -1) {
        return users.splice(index, 1)[0]
    }
}

//Get User
const getUser = (id) => {
    return users.find((user) => user.id === id)
}

//Get Users in Room
const getUsersInRoom = (room) => {
    return users.filter((user) => user.room === room)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}