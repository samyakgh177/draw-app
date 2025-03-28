"use client"
export function AuthPage({ isSignin }: {
    isSignin: boolean
}) {
    return (
        <div className="w-screen h-screen flex justify-center items-center bg-gray-100">
            <div className="p-6 m-6 bg-white rounded-lg shadow-md">
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Email"
                        className="w-full px-4 py-2 border rounded-md placeholder-black focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>
                <div className="mb-4">
                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full px-4 py-2 border rounded-md placeholder-black focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>
                <button
                    className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                    onClick={() => { }}
                >
                    {isSignin ? "Sign in" : "Sign up"}
                </button>
            </div>
        </div>

    );
}