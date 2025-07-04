import { useFetcher } from "react-router-dom";
import { BoldLink, FormContainer, InputField } from "./Common";


function SingUpForm() {
    let fetcher = useFetcher();

    return <>
        <FormContainer title="Sign Up">
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
        {JSON.stringify(fetcher.data, null, 2)}
    </>
}

export default SingUpForm