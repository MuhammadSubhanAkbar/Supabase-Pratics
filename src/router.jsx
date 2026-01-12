import { createBrowserRouter } from "react-router-dom";
import SignIn from "./components/SignIn.jsx";
import Dashboard from "./routers/Dashboard.jsx"
import Header from "./components/Header.jsx"

export const router =  createBrowserRouter([
    {
        path:'/',
        element:<SignIn />,
    },
    {
        path:'/dashboard',
        element:(
            <>
                <Header/>
                <Dashboard />
            </>
        )
    }
])