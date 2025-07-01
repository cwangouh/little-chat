import Menu from "./Menu"

function Chat() {
    return <div className="flex flex-col mx-3">
        <div className="h-10 min-w-[500px] bg-blue-900 flex flex-row text-white font-semibold">
            <span className="h-full px-2 flex items-center hover:bg-blue-950">Create chat</span>
            <span className="h-full px-2 flex items-center hover:bg-blue-950">Log out</span>
        </div>
        <div className="flex flex-row gap-0">
            <Menu />
            <div className="min-w-45 border-1 border-l-0 border-gray-300 flex-1"></div>
        </div>
    </div>
}

export default Chat