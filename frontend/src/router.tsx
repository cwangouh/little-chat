import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import ChatPanel, { ChatPanelPlaceholder } from "./components/chat/ChatPanel";
import ChatScreen from "./components/chat/ChatScreen";
import LoginForm from "./components/forms/Login";
import SingUpForm from "./components/forms/SignUp";
import { signUpAction } from "./fetches/signup";

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
        ],
    },
]);
