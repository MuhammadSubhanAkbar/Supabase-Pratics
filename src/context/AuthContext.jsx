import { createContext, useState, useContext, useEffect } from 'react';
import supabase from '../supbase-client.js';

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
    // undefined = loading, null = no user, object = user logged in
    const [session, setSession] = useState(undefined);

    useEffect(() => {
        // 1. Get initial session
        const getInitialSession = async () => {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) console.error('Error fetching session:', error.message);
            setSession(session);
        };

        getInitialSession();

        // 2. Listen for auth changes (sign in, sign out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        // 3. Cleanup subscription on unmount
        return () => subscription.unsubscribe();
    }, []);

    const signInUser = async (email, password) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email.toLowerCase(),
                password: password,
            });

            if (error) return { success: false, error: error.message };
            return { success: true, data };
        } catch (err) {
            return { success: false, error: 'An unexpected error occurred.' };
        }
    };

    const signOutUser = () => supabase.auth.signOut();

    return (
        <AuthContext.Provider value={{ session, signInUser, signOutUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);