export const UserElement: React.FC = () => (
    <div className="flex flex-col px-2 py-1 border-b border-gray-300 last-of-type:border-0 first-of-type:border-t hover:border-r-8">
        <div className="flex flex-row gap-2">
            <span className="font-bold whitespace-nowrap overflow-hidden text-ellipsis max-w-full block">
                John Smith
            </span>
            <span className="text-left text-gray-600 overflow-hidden text-ellipsis max-w-full">
                @john_smth
            </span>
        </div>
        <span className="text-left text-gray-600">
            Start conversation
        </span>
    </div>
);
  
function Menu() {
    return <>
        <div className="min-w-xs max-w-sm mx-auto flex flex-col border-1 border-gray-300">
            <h3 className="text-left px-2 py-1">Chats available</h3>
            <div className="flex flex-col">
                <UserElement />
                <UserElement />
                <UserElement />
                <UserElement />
            </div>
        </div>
    </>
}

export default Menu