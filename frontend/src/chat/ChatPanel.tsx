import { TextMessage } from "./Message";

const Conversation: React.FC = () => {
    return <>
        <div className="w-full px-2 pt-3 bg-amber-50 flex-1 overflow-y-auto">
            <div className="flex flex-col overflow-y-auto">
                <TextMessage is_my={true} text="Hi there!" />
                <TextMessage is_my={false} text="Hi there!" />
                <TextMessage is_my={true} text="Hi there!" />
                <TextMessage is_my={true} text="Hi there!" />
                <TextMessage is_my={false} text="Hi there!" />
                <TextMessage is_my={false} text="Hi there!" />
            </div>
        </div>
    </>
}

const InputPanel: React.FC = () => {
    return <>
        <div className="min-h-10 w-full z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] flex flex-row">
            <textarea
                className="w-full p-2 resize-none overflow-y-auto max-h-48 flex-1 border-1 border-transparent border-r-gray-300 focus:outline-none focus:border-amber-400 placeholder:text-gray-300"
                rows={1}
                placeholder="Type your message..."
                onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = `${target.scrollHeight}px`;
                }}
            />
            <div className="min-w-20 hover:bg-gray-100 flex items-center justify-center px-2">Send</div>
        </div>
    </>
}

const ChatPanel: React.FC = () => {
    return <div className="min-w-45 border-1 border-l-0 border-gray-300 flex-1">
        <div className="w-full h-full flex flex-col">
            <div className="min-h-10 w-full z-10 px-2 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] flex flex-row items-center">
                <span className="font-bold">John Smith</span>
            </div>
            <Conversation />
            <InputPanel />
        </div>
    </div>
}

export default ChatPanel