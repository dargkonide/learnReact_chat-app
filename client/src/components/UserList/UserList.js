import React from 'react';
import ScrollToBottom from 'react-scroll-to-bottom';

const UserList = ({ users }) => (
    <ScrollToBottom >
        {users.map(( user, i ) => <div key={i}>{user}</div>)}
    </ScrollToBottom>
)

export default UserList;