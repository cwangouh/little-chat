import { Outlet } from 'react-router-dom';
import './App.css';
import { ChatsProvider } from './contexts/ChatContext';
import { MessagesProvider } from './contexts/MessageContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { UserProvider } from './contexts/UserContext';

function App() {
  return (
    <NotificationProvider>
      <MessagesProvider>
        <UserProvider>
          <ChatsProvider>
            <Outlet />
          </ChatsProvider>
        </UserProvider>
      </MessagesProvider>
    </NotificationProvider>
  );
}

export default App
