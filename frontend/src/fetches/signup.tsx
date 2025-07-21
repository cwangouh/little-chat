import { StatusCodes } from "http-status-codes";
import { redirect, type ActionFunctionArgs } from "react-router-dom";



export async function signUpAction({ request }: ActionFunctionArgs) {
    const formData = await request.formData();

    const payload = {
        first_name: formData.get("first_name"),
        surname: formData.get("surname"),
        tag: formData.get("tag"),
        password: formData.get("password"),
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