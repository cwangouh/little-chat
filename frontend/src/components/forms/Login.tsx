import { BoldLink, FormContainer } from "./Common";

import { useFetcher } from "react-router-dom";
import { Codes } from "../../fetches/codes";
import type { AppResponse, AppResponseError } from "../../fetches/responses";
import { ErrorBar, InputField } from "./Common";

interface LoginErrorBarProps {
    error?: AppResponseError;
}

const LoginErrorBar: React.FC<LoginErrorBarProps> = ({ error }) => {
    if (!error) {
        return <></>;
    }

    let text = "";

    switch (Number(error.code)) {
        case Codes.REQUEST_VALIDATION_ERROR:
        case Codes.PYDANTIC_VALIDATION_ERROR:
            text = "Wrong format of tag or password.";
            break;

        case Codes.INCORRECT_CREDENTIALS:
            text = "Invalid tag or password.";
            break;

        default:
            return <></>;
    }

    return <ErrorBar text={text} />;
};


function LoginForm() {
    const fetcher = useFetcher<AppResponse>();

    return (
        <FormContainer title="Log In">
            {!fetcher.data?.ok && fetcher.data?.data?.error && (
                <LoginErrorBar error={fetcher.data.data.error} />
            )}

            <fetcher.Form method="post" className="flex flex-col gap-4">
                <InputField id="tag" label="Tag" />
                <InputField id="password" type="password" label="Password" />

                <button
                    type="submit"
                    className="self-center bg-amber-400 hover:bg-amber-500 text-black font-medium py-1.5 px-4 rounded transition-colors duration-200"
                >
                    Enter
                </button>
            </fetcher.Form>

            <span className="block text-xs text-center pt-4">
                Or <BoldLink to="/signup">sign up</BoldLink> if you don't have an account
            </span>
        </FormContainer>
    );
}

export default LoginForm;



// function LoginForm() {
// return (
//     <FormContainer title="Log In">
//         <form className="flex flex-col gap-4">
//             <div className="flex items-center gap-3">
//                 <label htmlFor="username" className="w-24 text-right font-medium">
//                     Tag
//                 </label>
//                 <input
//                     id="username"
//                     type="text"
//                     className="flex-1 px-3 py-1 rounded border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
//                 />
//             </div>

//             <div className="flex items-center gap-3">
//                 <label htmlFor="password" className="w-24 text-right font-medium">
//                     Password
//                 </label>
//                 <input
//                     id="password"
//                     type="password"
//                     className="flex-1 px-3 py-1 rounded border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
//                 />
//             </div>

//             <button
//                 type="submit"
//                 className="self-center bg-amber-400 hover:bg-amber-500 text-black font-medium py-1.5 px-4 rounded transition-colors duration-200"
//             >
//                 Enter
//             </button>
//         </form>

//         <span className="block text-xs text-center pt-4">
//             Or <BoldLink to="/signup">sign up</BoldLink> if you don't have an account
//         </span>
//     </FormContainer>
// )
// }
// 
// export default LoginForm