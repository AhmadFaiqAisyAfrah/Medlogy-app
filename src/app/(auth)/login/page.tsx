import { login } from './actions'

export default function LoginPage({
    searchParams,
}: {
    searchParams: { error?: string; message?: string }
}) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
            <div className="w-full max-w-md">
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 backdrop-blur-sm">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">Medlogy</h1>
                        <p className="text-zinc-400">Sign in to your account</p>
                    </div>

                    {searchParams.error && (
                        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                            {searchParams.error}
                        </div>
                    )}

                    {searchParams.message && (
                        <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
                            {searchParams.message}
                        </div>
                    )}

                    <form className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-1.5">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-zinc-300 mb-1.5">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            formAction={login}
                            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
                        >
                            Sign In
                        </button>

                        <p className="text-center text-zinc-400 text-sm mt-4">
                            Don't have an account yet? <a href="/signup" className="text-emerald-500 hover:text-emerald-400">Sign Up</a>
                        </p>

                        <div className="mt-6 p-4 rounded-lg bg-zinc-950/50 border border-zinc-800">
                            <p className="text-xs text-zinc-500 text-center">
                                DISCLAIMER: Medlogy is a health intelligence platform and does not provide medical diagnosis.
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
