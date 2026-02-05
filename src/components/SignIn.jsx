import { useActionState } from 'react';
import { useAuth } from '../context/AuthContext';


const Signin = () => {
    const { signInUser } = useAuth();

    const [errorMessage, submitAction, isPending] = useActionState(
        async (previousState, formData) => {
            const email = formData.get('email');
            const password = formData.get('password');

            const { success, error: signInError } = await signInUser(email, password);

            if (!success) {
                // This string becomes the "errorMessage" variable
                return signInError;
            }

            // Navigation happens here on success
            console.log("Login successful!");
            // navigate('/dashboard');

            return null;
        },
        null // Initial error state
    );

    return (
        <>
            <h1 className="landing-header">Paper Like A Boss</h1>
            <div className="sign-form-container">
                <form action={submitAction} className="auth-form">
                    <h2 className="form-title">Sign in</h2>
                    <p>
                        Don't have an account yet? <strong>Sign up</strong>
                    </p>

                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input
                            className="form-input"
                            type="email"
                            name="email"
                            id="email"
                            required
                            disabled={isPending}
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            className="form-input"
                            type="password"
                            name="password"
                            id="password"
                            required
                            disabled={isPending}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="form-button"
                    >
                        {isPending ? 'Signing in...' : 'Sign In'}
                    </button>

                    {errorMessage && (
                        <div role="alert" className="sign-form-error-message">
                            {errorMessage}
                        </div>
                    )}
                </form>
            </div>
        </>
    );
};

export default Signin;