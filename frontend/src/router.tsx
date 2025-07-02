import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import ChatPanel, { ChatPanelPlaceholder } from "./chat/ChatPanel";
import ChatScreen from "./chat/ChatScreen";
import LoginForm from "./forms/Login";
import SingUpForm from "./forms/SignUp";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {
                index: true,
                element: <LoginForm />,
            },
            {
                path: "signup",
                element: <SingUpForm />
            },
            {
                path: "chat",
                element: <ChatScreen />,
                children: [
                    {
                        index: true,
                        element: <ChatPanelPlaceholder />
                    },
                    {
                        path: ":chatId",
                        element: <ChatPanel />
                    }
                ]
            },
        ],
    },
]);
