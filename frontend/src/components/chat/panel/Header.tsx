import { useState } from "react";
import { useFetcher } from "react-router-dom";
import { useUser } from "../../../contexts/UserContext";
import MyProfileModal from "../../MyProfileModal";

const Header: React.FC = () => {
    const fetcher = useFetcher();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const { logout } = useUser();

    return (
        <>
            <div className="h-10 px-2 min-w-[500px] bg-blue-900 flex flex-row-reverse text-white font-semibold">
                <fetcher.Form method="post" action="/logout" onClick={() => logout()}>
                    <button
                        type="submit"
                        className="h-full px-2 flex items-center hover:bg-blue-950"
                    >
                        Log out
                    </button>
                </fetcher.Form>

                <span
                    className="h-full px-2 flex items-center hover:bg-blue-950 cursor-pointer"
                    onClick={() => setIsProfileOpen(true)}
                >
                    Profile
                </span>
                {/* <span
                    className="h-full px-2 flex items-center"
                >
                    {currentUser?.tag}
                </span> */}
            </div>
            {
                isProfileOpen && (
                    <MyProfileModal onClose={() => setIsProfileOpen(false)} />
                )
            }
        </>
    );
};

export default Header;
