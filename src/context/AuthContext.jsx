import { createContext, useState, useContext, useEffect } from 'react';
import supabase from '../supbase-client.js';

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
//Session state (user info, sign-in status)
    const [session, setSession] = useState(undefined);

    useEffect(() => {
        //1. Check initial session
        const getInitalSession = async () => {
            try {
                const { data, error } = await supabase.auth.getSession();

                if (error) {
                    throw error;
                }

                console.log(data.session)
                setSession(data.session);
            }catch (error) {
                console.error("Error is getting session:", error.message);
            }
        };

        getInitalSession();

        //2. Listen for auth state changes (it uses .onAuthStateChange)
        const { data: authListener } = supabase.auth.onAuthStateChange(
            (event, session)=>{
                setSession(session);
                console.log("Session changed:", session)

            }
        );

        return (
            authListener.subscription.unsubscribe()
        )


    }, []);

//Auth functions (sign-in, signup, logout)


    return (
        <AuthContext.Provider value={{ session }}>
            {children}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    return useContext(AuthContext);
};