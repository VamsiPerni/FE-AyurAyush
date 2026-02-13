import { Slide, toast } from "react-toastify";

const showErrorToast = (txt) => {
    toast.error(txt, {
        position: "bottom-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        transition: Slide,
    });
};

const showSuccessToast = (txt) => {
    toast.success(txt, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        transition: Slide,
    });
};
export { showErrorToast, showSuccessToast };
