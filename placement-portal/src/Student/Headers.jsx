import {toast, ToastContainer} from "react-toastify";
import './Headers.css'
export function Headers(){

    // =================================================
    // LOGOUT
    // =================================================

    const logout = () => {

        localStorage.removeItem(
            "token"
        );

        toast.success(
            "Logged out successfully!"
        );

        setTimeout(() => {

            window.location.href = "/";

        }, 1000);
    };
    return (

        <>
            <ToastContainer
                position="top-right"
                autoClose={4000}
                newestOnTop
                closeOnClick
                pauseOnHover
                draggable
                theme="light"
            />
            <div className="header">

                <div className="data"></div>

                <div className="title">
                    IIIT KALYANI PLACEMENT PORTAL
                </div>

                <button
                    className="logout-btn"
                    onClick={logout}
                >
                    Logout
                </button>

            </div>
        </>
    );
}