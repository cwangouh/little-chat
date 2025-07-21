import { useFetcher } from "react-router-dom";
import { Codes } from "../../fetches/codes";
import type { AppResponse, AppResponseError } from "../../fetches/responses";
import { BoldLink, ErrorBar, FormContainer, InputField } from "./Common";


interface SignUpErrorBar {
    error?: AppResponseError
}

const SingUpErrorBar: React.FC<SignUpErrorBar> = ({ error }) => {
    if (!error) {
        return <></>
    }

    let text = "";
    switch (Number(error.code)) {
        case Codes.REQUEST_VALIDATION_ERROR:
        case Codes.PYDANTIC_VALIDATION_ERROR:
            // TODO: Make it smarter
            console.log("KEK")
            text = "Wrong format of the entered data."
            break;

        case Codes.INTEGRITY_ERROR:
            text = "This tag is already in use."
            break;

        default:
            return <></>
    }


    return <ErrorBar text={text} />
}


function SingUpForm() {
    let fetcher = useFetcher<AppResponse>();

    return <>
        <FormContainer title="Sign Up">
            {!fetcher.data?.ok && fetcher.data?.data?.error && <SingUpErrorBar error={fetcher.data?.data?.error} />}
            <fetcher.Form method="post" className="flex flex-col gap-4">
                <InputField id="first_name" label="First name" />
                <InputField id="surname" label="Surname" />
                <InputField id="tag" label="Tag" />
                <InputField id="password" type="password" label="Password" />
                <button
                    type="submit"
                    className="self-center bg-amber-400 hover:bg-amber-500 text-black font-medium py-1.5 px-4 rounded transition-colors duration-200"
                >
                    Sign up
                </button>
            </fetcher.Form>
            <span className="block text-xs text-center pt-4">
                <BoldLink to="/">Log in</BoldLink> if you have an account
            </span>
        </FormContainer>
    </>
}

export default SingUpForm