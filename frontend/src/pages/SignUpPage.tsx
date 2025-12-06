import axios from "axios";
import { useState } from "react";
import { useToast } from "../components/ui/toast";

function SignupPage() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const handleGoogleAuth = async () => {
        try {
            setIsLoading(true);

            // Get Google OAuth URL from your backend
            const response = await axios.get(`${import.meta.env.VITE_SERVER_URI}/api/v1/auth/google/url`);
            const { authUrl } = response.data.data;

            // Redirect to Google OAuth
            window.location.href = authUrl;
        } catch (error: any) {
            toast({
                title: "Authentication Failed",
                description:
                    error.response?.data?.message ||
                    "Failed to initialize Google authentication",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Header with Calendar Icon */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-4">
                        <svg className="w-8 h-8 text-[#1a73e8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-normal text-gray-800 mb-2">
                        Create your SlotSweeper account
                    </h1>
                    <p className="text-sm text-gray-600">
                        Join us today and manage your schedule efficiently
                    </p>
                </div>

                {/* Signup Form Card */}
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-10">
                    {/* SMTP Unavailable Notice */}
                    <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="flex items-start">
                            <div className="shrink-0">
                                <svg className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-amber-800">Email Sign Up Temporarily Unavailable</h3>
                                <p className="mt-1 text-xs text-amber-700">
                                    Due to hosting restrictions on Render (SMTP ports are blocked), email/OTP verification is currently unavailable. 
                                    Please use <strong>Google Sign In</strong> to create your account.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Google Sign up - Primary Option */}
                    <div className="mb-6">
                        <button
                            type="button"
                            onClick={handleGoogleAuth}
                            disabled={isLoading}
                            className="w-full inline-flex justify-center items-center py-3 px-4 border-2 border-[#1a73e8] rounded-md shadow-sm bg-white text-sm font-medium text-[#1a73e8] hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1a73e8] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                                <path
                                    fill="#4285F4"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="#34A853"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="#FBBC05"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="#EA4335"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            {isLoading ? "Loading..." : "Sign up with Google (Recommended)"}
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="relative py-4">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="px-4 bg-white text-gray-400 uppercase tracking-wider">
                                Email sign up disabled
                            </span>
                        </div>
                    </div>

                    {/* Disabled Email Form */}
                    <div className="opacity-50 pointer-events-none select-none">
                        <div className="space-y-5">
                            {/* Name Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    disabled
                                    className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-md bg-gray-50 text-gray-400 text-sm cursor-not-allowed"
                                    placeholder="Not available"
                                />
                            </div>

                            {/* Email Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    disabled
                                    className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-md bg-gray-50 text-gray-400 text-sm cursor-not-allowed"
                                    placeholder="Not available"
                                />
                            </div>

                            {/* Password Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    disabled
                                    className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-md bg-gray-50 text-gray-400 text-sm cursor-not-allowed"
                                    placeholder="Not available"
                                />
                            </div>

                            {/* Disabled button */}
                            <div className="pt-2">
                                <button
                                    type="button"
                                    disabled
                                    className="w-full py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gray-300 cursor-not-allowed"
                                >
                                    Email Sign Up Unavailable
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sign in link */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        Already have an account?{" "}
                        <a
                            href="/login"
                            className="font-medium text-[#1a73e8] hover:text-[#1557b0] transition-colors"
                        >
                            Sign in
                        </a>
                    </p>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
                        <a href="#" className="hover:text-gray-700 transition-colors">Help</a>
                        <span className="text-gray-300">•</span>
                        <a href="#" className="hover:text-gray-700 transition-colors">Privacy</a>
                        <span className="text-gray-300">•</span>
                        <a href="#" className="hover:text-gray-700 transition-colors">Terms</a>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SignupPage;
