import { useEffect, useState } from "react";
import { useAuthFetch } from "../fetches/auth";
import { BasicModal, SecondaryButton } from "./Common";

interface ProfileModalProps {
    onClose: () => void;
}

interface UserMe {
    first_name: string;
    surname: string;
    tag: string;
    bio: string | null;
}



const MyProfileModal: React.FC<ProfileModalProps> = ({ onClose }) => {
    const [profile, setProfile] = useState<UserMe | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isEditing, setIsEditing] = useState(false);
    const [draftBio, setDraftBio] = useState("");
    const authFetch = useAuthFetch();

    useEffect(() => {
        let cancelled = false;

        async function loadProfile() {
            try {
                const response = await authFetch("http://localhost:8000/api/v1/user/me", {
                    credentials: "include",
                });

                if (!response.ok) {
                    throw new Error("Failed to load profile");
                }

                const data = await response.json();

                if (!cancelled) {
                    setProfile(data);
                    setDraftBio(data.bio ?? "");
                }
            } catch (e) {
                if (!cancelled) {
                    setError((e as Error).message);
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        }

        loadProfile();

        return () => {
            cancelled = true;
        };
    }, []);

    const startEditing = () => {
        setDraftBio(profile?.bio ?? "");
        setIsEditing(true);
    };

    const saveBio = async () => {
        try {
            const response = await authFetch("http://localhost:8000/api/v1/user/me", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    bio: draftBio,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to update bio");
            }

            const updatedUser = await response.json();
            setProfile(updatedUser);
            setIsEditing(false);
            setError(null);
        } catch (error) {
            setError("Failed to update bio. Please try again.");
            setProfile((prev) =>
                prev ? { ...prev } : prev
            );
        }
    };



    return (
        <BasicModal onClose={onClose}>
            {isLoading && (
                <div className="text-sm text-gray-500">
                    Loading profile…
                </div>
            )}

            {error && (
                <div className="text-sm text-red-500">
                    {error}
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
                    </div>

                    {!isEditing ? (
                        <>
                            <div className="text-sm whitespace-pre-wrap">
                                {profile.bio || "No bio yet"}
                            </div>

                            <SecondaryButton onClick={startEditing}>
                                Change bio
                            </SecondaryButton>
                        </>
                    ) : (
                        <div className="flex flex-col gap-3">
                            <textarea
                                value={draftBio}
                                onChange={(e) => setDraftBio(e.target.value)}
                                rows={3}
                                className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                            />

                            <SecondaryButton onClick={saveBio}>
                                Save
                            </SecondaryButton>
                        </div>
                    )}
                </div>
            )}
        </BasicModal>
    );
};

export default MyProfileModal;
