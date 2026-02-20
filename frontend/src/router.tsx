import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import ChatPanel, { ChatPanelPlaceholder } from "./components/chat/panel/ChatPanel";
import ChatScreen from "./components/chat/panel/ChatScreen";
import LoginForm from "./components/forms/Login";
import SingUpForm from "./components/forms/SignUp";
import { loginAction, logoutAction, signUpAction } from "./fetches/auth";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {
                index: true,
                element: <LoginForm />,
                action: loginAction
            },
            {
                path: "signup",
                element: <SingUpForm />,
                action: signUpAction
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
            {
                path: "logout",
                action: logoutAction
            }
        ],
    },
]);
