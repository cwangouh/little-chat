import type { User } from "../../../contexts/UserContext";
import { BasicModal } from "../../Common";

interface ProfileModalProps {
    onClose: () => void;
    profile: User | null;
}

const OtherProfileModal: React.FC<ProfileModalProps> = ({ onClose, profile }) => {
    return (
        <BasicModal onClose={onClose}>
            {!profile && (
                <div className="text-sm text-gray-500">
                    Loading profile…
                </div>
            )}

            {profile && (
                <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-0">
                        <div className="flex w-100% justify-center mb-2 mt-2">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-bold">
                                    {profile.first_name.charAt(0)}{profile.surname.charAt(0)}
                                </span>
                            </div>
                        </div>
                        <div className="text-lg font-semibold">
                            {profile.first_name} {profile.surname}
                        </div>
                        <div className="text-sm text-gray-500">
                            @{profile.tag}
                        </div>
                        <div className="text-sm whitespace-pre-wrap mt-3">
                            {profile.bio || <span className="text-gray-500">No bio yet</span>}
                        </div>
                    </div>
                </div>
            )}
        </BasicModal>
    );
};

export default OtherProfileModal;
