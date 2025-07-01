import { FormContainer, InputField } from "./Common"

function SingUpForm() {
    return (
        <FormContainer title="Sign Up">
            <InputField id="first_name" label="First name" />
            <InputField id="surname" label="Surname" />
            <InputField id="tag" label="Tag" />
            <InputField id="password" label="Password" />

            <button
                type="submit"
                className="self-center bg-amber-400 hover:bg-amber-500 text-black font-medium py-1.5 px-4 rounded transition-colors duration-200"
            >
                Sing up
            </button>
        </FormContainer>
    )
}

export default SingUpForm