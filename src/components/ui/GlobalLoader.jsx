import { PageLoader } from "./Spinner";

const GlobalLoader = ({ message = "Loading..." }) => {
    return <PageLoader message={message} />;
};

export { GlobalLoader };
export default GlobalLoader;
