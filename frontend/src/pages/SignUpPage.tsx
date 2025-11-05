"use client";
import axios from "axios";
import { useToast } from "../components/ui/toast";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

function SignupPage() {
    const { toast } = useToast();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showOtpForm, setShowOtpForm] = useState(false);
    const [otp, setOtp] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        if (password !== confirmPassword) {
            toast({
                title: "Password Mismatch",
                description: "Passwords do not match. Please try again.",
                variant: "destructive",
            });
            setIsLoading(false);
            return;
        }

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_SERVER_URI}/api/v1/auth/signup`,
                {
                    email,
                    name,
                    password,
                }
            );
            // after here otp is sent

            toast({
                title: "OTP Sent!",
                description: "Please check your email for the verification code.",
                variant: "success",
            });

            setShowOtpForm(true); // Show OTP form after successful signup
        } catch (error: any) {
            toast({
                title: "Signup Failed",
                description: error?.response?.data.message,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        if (!otp || otp.length !== 5) {
            toast({
                title: "Invalid OTP",
                description: "Please enter a valid 5-digit OTP.",
                variant: "destructive",
            });
            setIsLoading(false);
            return;
        }

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_SERVER_URI}/api/v1/auth/verifyOTP`,
                {
                    email,
                    name,
                    password,
                    otp,
                }
            );

            toast({
                title: "Account Created!",
                description: "Your account has been created successfully.",
                variant: "success",
            });

            // Redirect to dashboard or home page
            navigate("/");
        } catch (error) {
            toast({
                title: "Verification Failed",
                description: "Invalid OTP. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleAuth = async () => {
        try {
            setIsLoading(true);

            // Get Google OAuth URL from your backend
            const response = await axios.get(`${import.meta.env.VITE_SERVER_URI}/api/auth/google/url`);
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
                    <form
                        className="space-y-5"
                        onSubmit={showOtpForm ? handleOtpSubmit : handleSubmit}
                    >
                        {!showOtpForm ? (
                            <>
                                {/* Name Input */}
                                <div>
                                    <label
                                        htmlFor="name"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        Full Name
                                    </label>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        autoComplete="name"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-md placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1a73e8] focus:border-transparent transition-all duration-200 text-sm"
                                        placeholder="John Doe"
                                    />
                                </div>

                                {/* Email Input */}
                                <div>
                                    <label
                                        htmlFor="email"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        Email
                                    </label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-md placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1a73e8] focus:border-transparent transition-all duration-200 text-sm"
                                        placeholder="your.email@example.com"
                                    />
                                </div>

                                {/* Password Input */}
                                <div>
                                    <label
                                        htmlFor="password"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            autoComplete="new-password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="appearance-none block w-full px-4 py-3 pr-12 border border-gray-300 rounded-md placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1a73e8] focus:border-transparent transition-all duration-200 text-sm"
                                            placeholder="Create a strong password"
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center hover:opacity-70 transition-opacity"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? (
                                                <svg
                                                    className="h-5 w-5 text-gray-500"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                                                    />
                                                </svg>
                                            ) : (
                                                <svg
                                                    className="h-5 w-5 text-gray-500"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                    />
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                    />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Confirm Password Input */}
                                <div>
                                    <label
                                        htmlFor="confirmPassword"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type={showConfirmPassword ? "text" : "password"}
                                            autoComplete="new-password"
                                            required
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="appearance-none block w-full px-4 py-3 pr-12 border border-gray-300 rounded-md placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1a73e8] focus:border-transparent transition-all duration-200 text-sm"
                                            placeholder="Confirm your password"
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center hover:opacity-70 transition-opacity"
                                            onClick={() =>
                                                setShowConfirmPassword(!showConfirmPassword)
                                            }
                                        >
                                            {showConfirmPassword ? (
                                                <svg
                                                    className="h-5 w-5 text-gray-500"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                                                    />
                                                </svg>
                                            ) : (
                                                <svg
                                                    className="h-5 w-5 text-gray-500"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                    />
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                    />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Terms and Conditions */}
                                <div className="flex items-start">
                                    <input
                                        id="agree-terms"
                                        name="agree-terms"
                                        type="checkbox"
                                        required
                                        className="h-4 w-4 text-[#1a73e8] focus:ring-[#1a73e8] border-gray-300 rounded mt-0.5"
                                    />
                                    <label
                                        htmlFor="agree-terms"
                                        className="ml-2 block text-sm text-gray-700"
                                    >
                                        I agree to the{" "}
                                        <a
                                            href="#"
                                            className="text-[#1a73e8] hover:text-[#1557b0] transition-colors"
                                        >
                                            Terms and Conditions
                                        </a>
                                    </label>
                                </div>

                                {/* Sign up button */}
                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#1a73e8] hover:bg-[#1557b0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1a73e8] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                    >
                                        {isLoading ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Creating Account...
                                            </>
                                        ) : (
                                            'Create Account'
                                        )}
                                    </button>
                                </div>

                                {/* Divider */}
                                <div className="relative py-4">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-200" />
                                    </div>
                                    <div className="relative flex justify-center text-xs">
                                        <span className="px-4 bg-white text-gray-500 uppercase tracking-wider">
                                            Or
                                        </span>
                                    </div>
                                </div>

                                {/* Google Sign up */}
                                <div>
                                    <button
                                        type="button"
                                        onClick={handleGoogleAuth}
                                        disabled={isLoading}
                                        className="w-full inline-flex justify-center items-center py-3 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1a73e8] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
                                        {isLoading ? "Loading..." : "Continue with Google"}
                                    </button>
                                </div>

                            </>
                        ) : (
                            <>
                                {/* OTP Verification Form */}
                                <div className="text-center mb-6">
                                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-50">
                                        <svg
                                            className="h-8 w-8 text-[#1a73e8]"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                            />
                                        </svg>
                                    </div>
                                    <h3 className="mt-4 text-xl font-normal text-gray-800">
                                        Check your email
                                    </h3>
                                    <p className="mt-2 text-sm text-gray-600">
                                        We've sent a 5-digit verification code to
                                    </p>
                                    <p className="text-sm font-medium text-gray-800">{email}</p>
                                </div>

                                {/* OTP Input */}
                                <div>
                                    <label
                                        htmlFor="otp"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        Verification Code
                                    </label>
                                    <input
                                        id="otp"
                                        name="otp"
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        maxLength={5}
                                        required
                                        value={otp}
                                        onChange={(e) =>
                                            setOtp(e.target.value.replace(/\D/g, ""))
                                        }
                                        className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-md placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1a73e8] focus:border-transparent text-center text-2xl tracking-[0.5em] transition-all duration-200"
                                        placeholder="12345"
                                    />
                                    <p className="mt-2 text-xs text-gray-500 text-center">
                                        Enter the 5-digit code sent to your email
                                    </p>
                                </div>

                                {/* Verify button */}
                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={isLoading || otp.length !== 5}
                                        className="w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#1a73e8] hover:bg-[#1557b0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1a73e8] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                    >
                                        {isLoading ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Verifying...
                                            </>
                                        ) : (
                                            'Verify Account'
                                        )}
                                    </button>
                                </div>

                                {/* Resend OTP */}
                                <div className="text-center pt-4">
                                    <p className="text-sm text-gray-600">
                                        Didn't receive the code?{" "}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowOtpForm(false);
                                                handleSubmit({
                                                    preventDefault: () => { },
                                                } as React.FormEvent);
                                            }}
                                            className="font-medium text-[#1a73e8] hover:text-[#1557b0] transition-colors"
                                        >
                                            Resend
                                        </button>
                                    </p>
                                </div>

                                {/* Back to signup link */}
                                <div className="text-center pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowOtpForm(false)}
                                        className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
                                    >
                                        ← Back to signup form
                                    </button>
                                </div>
                            </>
                        )}
                    </form>
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