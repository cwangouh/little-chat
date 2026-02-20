import { StatusCodes } from "http-status-codes";
import { redirect, useNavigate, type ActionFunctionArgs } from "react-router-dom";


export const fetchProtected = async (
    url: string,
    options: RequestInit = {}
): Promise<Response> => {
    let response = await fetch(url, {
        ...options,
        credentials: "include",
    });

    if (response.status === StatusCodes.FORBIDDEN && !url.includes('token/refresh')) {
        try {
            const refreshResponse = await fetch(
                "http://localhost:8000/api/v1/auth/token/refresh",
                {
                    method: "POST",
                    credentials: "include",
                }
            );

            if (refreshResponse.status === StatusCodes.CREATED) {
                await new Promise(resolve => setTimeout(resolve, 50));
                return fetch(url, {
                    ...options,
                    credentials: "include",
                });
            }

            throw new Error("Refresh failed with status: " + refreshResponse.status);

        } catch (refreshError) {
            const error = new Error("SESSION_EXPIRED");
            error.cause = refreshError;
            throw error;
        }
    }

    if (response.status === StatusCodes.UNAUTHORIZED) {
        const error = new Error("UNAUTHORIZED");
        error.cause = response;
        throw error;
    }

    return response;
};



export function useAuthFetch() {
    const navigate = useNavigate();

    const authFetch = async (url: string, options: RequestInit = {}) => {
        try {
            return await fetchProtected(url, options);
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === "SESSION_EXPIRED" || error.message === "UNAUTHORIZED") {
                    await fetch("http://localhost:8000/api/v1/auth/logout", {
                        method: "POST",
                        credentials: "include",
                    }).catch(() => { });

                    navigate("/");
                }
            }
            throw error;
        }
    };

    return authFetch;
}

export async function loginAction({ request }: ActionFunctionArgs) {
    const formData = await request.formData();

    const payload = new URLSearchParams();
    payload.append("username", String(formData.get("tag")));
    payload.append("password", String(formData.get("password")));

    try {
        const response = await fetch("http://localhost:8000/api/v1/auth/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: payload.toString(),
            credentials: "include",
        });

        if (response.status === StatusCodes.CREATED) {
            return redirect("/chat");
        }

        const data = await response.json();
        return {
            ok: response.ok,
            status: response.status,
            data,
        };
    } catch (error) {
        return {
            ok: false,
            message: (error as Error).message,
        };
    }
}


export async function logoutAction({ request }: ActionFunctionArgs) {
    try {
        const response = await fetch("http://localhost:8000/api/v1/auth/logout", {
            method: "POST",
            credentials: "include", // обязательно, иначе cookie не удалится
        });

        if (response.status === StatusCodes.OK) {
            return redirect("/");
        }

        const data = await response.json();
        return {
            ok: response.ok,
            status: response.status,
            data,
        };
    } catch (error) {
        return {
            ok: false,
            message: (error as Error).message,
        };
    }
}




export async function signUpAction({ request }: ActionFunctionArgs) {
    const formData = await request.formData();

    const payload = {
        first_name: formData.get("first_name"),
        surname: formData.get("surname"),
        tag: formData.get("tag"),
        password: formData.get("password"),
        bio: formData.get("bio") || "",
    };

    try {
        const response = await fetch("http://localhost:8000/api/v1/user", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
            credentials: "include"
        });

        if (response.status == StatusCodes.CREATED) {
            return redirect("/chat");
        }

        const data = await response.json();
        return {
            ok: response.ok,
            status: response.status,
            data,
        };

    } catch (error) {
        // LOG IT
        return {
            ok: false,
            message: (error as Error).message,
        };
    }
}