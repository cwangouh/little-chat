import { Outlet } from 'react-router-dom';
import './App.css';
import { ChatsProvider } from './contexts/ChatContext';
import { MessagesProvider } from './contexts/MessageContext';
import { UserProvider } from './contexts/UserContext';

function App() {
  return (
    <MessagesProvider>
      <UserProvider>
        <ChatsProvider>
          <Outlet />
        </ChatsProvider>
      </UserProvider>
    </MessagesProvider>
  );
}

export default App
