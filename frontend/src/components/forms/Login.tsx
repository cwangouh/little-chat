import { BoldLink } from "./Common"

function LoginForm() {
    return (
        <div className="max-w-sm mx-auto bg-amber-100 rounded-2xl shadow-md p-6">
            <h3 className="text-xl font-bold underline mb-4 text-center">Log in</h3>
            <form className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                    <label htmlFor="username" className="w-24 text-right font-medium">
                        Tag
                    </label>
                    <input
                        id="username"
                        type="text"
                        className="flex-1 px-3 py-1 rounded border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                </div>

                <div className="flex items-center gap-3">
                    <label htmlFor="password" className="w-24 text-right font-medium">
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        className="flex-1 px-3 py-1 rounded border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                </div>

                <button
                    type="submit"
                    className="self-center bg-amber-400 hover:bg-amber-500 text-black font-medium py-1.5 px-4 rounded transition-colors duration-200"
                >
                    Enter
                </button>
            </form>

            <span className="block text-xs text-center pt-4">
                Or <BoldLink to="/signup">sign up</BoldLink> if you don't have an account
            </span>
        </div>
    )
}

export default LoginForm