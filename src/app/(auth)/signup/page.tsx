
import { signup } from '@/app/(auth)/login/actions'

export default function SignupPage({
    searchParams,
}: {
    searchParams: { error?: string; message?: string }
}) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
            <div className="w-full max-w-lg">
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 backdrop-blur-sm">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">Medlogy</h1>
                        <p className="text-zinc-400">Identify yourself to access the platform</p>
                    </div>

                    {searchParams.error && (
                        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                            {searchParams.error}
                        </div>
                    )}

                    <form className="space-y-4">
                        {/* Display Name (Nickname) */}
                        <div>
                            <label htmlFor="display_name" className="block text-sm font-medium text-zinc-300 mb-1.5">Display Name (Nickname)</label>
                            <input id="display_name" name="display_name" type="text" required className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all" placeholder="Dr. Jane" />
                        </div>

                        {/* Full Name */}
                        <div>
                            <label htmlFor="full_name" className="block text-sm font-medium text-zinc-300 mb-1.5">Full Name</label>
                            <input id="full_name" name="full_name" type="text" required className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all" placeholder="Jane Doe" />
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-1.5">Email</label>
                            <input id="email" name="email" type="email" required className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all" placeholder="you@example.com" />
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-zinc-300 mb-1.5">Password</label>
                            <input id="password" name="password" type="password" required className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all" placeholder="••••••••" />
                        </div>

                        {/* Organization */}
                        <div>
                            <label htmlFor="organization" className="block text-sm font-medium text-zinc-300 mb-1.5">Organization / Institution</label>
                            <input id="organization" name="organization" type="text" required className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all" placeholder="University of Health..." />
                        </div>

                        {/* Role */}
                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-zinc-300 mb-1.5">Role</label>
                            <select id="role" name="role" required className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all appearance-none">
                                <option value="" disabled selected>Select your role...</option>
                                <option value="Public Health Analyst">Public Health Analyst</option>
                                <option value="Researcher">Researcher</option>
                                <option value="Student">Student</option>
                                <option value="Policy / Government">Policy / Government</option>
                                <option value="Clinician">Clinician (non-diagnostic)</option>
                                <option value="General Observer">General Observer</option>
                            </select>
                        </div>

                        {/* Country */}
                        <div>
                            <label htmlFor="country" className="block text-sm font-medium text-zinc-300 mb-1.5">Country</label>
                            <input id="country" name="country" type="text" required className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all" placeholder="Indonesia" />
                        </div>

                        <button formAction={signup} className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-zinc-900 mt-4">
                            Sign Up
                        </button>
                        <p className="text-center text-zinc-400 text-sm mt-4">
                            Already have an account? <a href="/login" className="text-emerald-500 hover:text-emerald-400">Sign In</a>
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
