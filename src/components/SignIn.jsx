import { useAuth } from "../context/AuthContext.jsx"

const SignIn = () => {

    const { session } = useAuth();


    return (
        <>
            <h1 className="landing-header">Paper like a boss.</h1>
        </>)
}
export default SignIn
