const Header: React.FC = () => {
    return <>
        <div className="h-10 px-2 min-w-[500px] bg-blue-900 flex flex-row-reverse text-white font-semibold">
            <span className="h-full px-2 flex items-center hover:bg-blue-950">Log out</span>
            <span className="h-full px-2 flex items-center hover:bg-blue-950">Settings</span>
        </div>
    </>
}

export default Header