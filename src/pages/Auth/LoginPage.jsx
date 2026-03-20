import { useState } from "react";
import { Link } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Card } from "../../components/ui/Card";
import { Stethoscope } from "lucide-react";

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { login, loading } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        await login(email, password);
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4">
            <Card className="w-full max-w-md">
                <div className="text-center mb-6">
                    <div className="w-14 h-14 bg-[#065A82]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Stethoscope size={28} className="text-[#065A82]" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Welcome Back
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Sign in to AyurAyush
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                    />

                    <Input
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                    />

                    <Button type="submit" className="w-full" loading={loading}>
                        Sign In
                    </Button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-6">
                    Don't have an account?{" "}
                    <Link
                        to="/signup"
                        className="text-[#065A82] font-medium hover:underline"
                    >
                        Sign up here
                    </Link>
                </p>
            </Card>
        </div>
    );
};

export { LoginPage };
