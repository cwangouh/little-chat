export const UserElement: React.FC = () => (
    <div className="flex flex-col pl-[8px] pr-2 py-1 border-b border-gray-300 hover:bg-gray-100">
        <div className="flex flex-row gap-2">
            <span className="font-bold whitespace-nowrap overflow-hidden text-ellipsis max-w-full block">
                John Smith
            </span>
            <span className="text-left text-gray-600 overflow-hidden text-ellipsis max-w-full">
                @john_smth
            </span>
        </div>
        <span className="text-left text-gray-600">
            Hi there!
        </span>
    </div>
);

function Menu() {
    return <>
        <div className="min-w-xs max-w-sm mx-auto flex flex-col border-1 border-gray-300">
            <div className="px-2 py-1 inline sticky top-0 border-b-1 border-gray-300 bg-white">
                <h3 className="float-start">Chats available</h3>
                <span className="float-end text-purple-800 hover:text-purple-900 font-semibold">+ Add chat</span>
            </div>
            <div className="flex flex-col overflow-y-auto">
                <UserElement />
                <UserElement />
                <UserElement />
                <UserElement />
                <UserElement />
                <UserElement />
                <UserElement />
                <UserElement />
                <UserElement />
                <UserElement />
                <UserElement />
                <UserElement />
                <UserElement />
                <UserElement />
                <UserElement />
                <UserElement />
            </div>
        </div>
    </>
}

export default Menu