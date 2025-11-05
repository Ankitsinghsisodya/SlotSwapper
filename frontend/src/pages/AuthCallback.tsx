import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

function AuthCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const code = searchParams.get('code');

        if (code) {
            sendCodeToBackend(code);
        } else {
            setError('Google authentication code not found.');
            setLoading(false);
        }

        async function sendCodeToBackend(authCode: string) {
            try {
                const backendUrl = `${import.meta.env.VITE_SERVER_URI}/api/v1/auth/google/googleLogin`;

                const response = await axios.post(backendUrl, { code: authCode });

                const { token } = response.data.data;
                localStorage.setItem('token', token);
                navigate('/dashboard');
            } catch (err: any) {
                console.error('Authentication error:', err);
                setError(err.message);
                setLoading(false);
                navigate('/login');
            }
        }
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-4">
                        <svg className="w-8 h-8 text-[#1a73e8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-normal text-gray-800 mb-2">
                        Authenticating...
                    </h1>
                    <p className="text-sm text-gray-600">Please wait while we process your authentication.</p>
                </div>

                {loading && (
                    <div className="text-center">
                        <svg className="animate-spin h-8 w-8 text-[#1a73e8] mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="text-sm text-gray-600">Processing authentication, please wait...</p>
                    </div>
                )}

                {error && (
                    <div className="text-center">
                        <h1 className="text-xl font-semibold text-red-600 mb-2">Authentication Failed</h1>
                        <p className="text-sm text-gray-600 mb-4">{error}</p>
                        <p className="text-sm text-gray-600">Redirecting to login...</p>
                    </div>
                )}

                {!loading && !error && (
                    <div className="text-center">
                        <h1 className="text-xl font-semibold text-green-600 mb-2">Authentication Successful</h1>
                        <p className="text-sm text-gray-600">Redirecting to your dashboard...</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AuthCallback;