import { Outlet } from "react-router-dom"
import Header from "./Header"
import Menu from "./Menu"

function ChatScreen() {
    return <div className="flex flex-col mx-3">
        <Header />
        <div className="max-h-160 flex flex-row gap-0">
            <Menu />
            <Outlet />
        </div>
    </div>
}

export default ChatScreen