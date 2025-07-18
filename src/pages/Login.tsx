import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from '../utils/api';

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const authTokenResponse = await api.post("/token/auth", {
                email,
                password,
                app_name: "wit-dev",
                app_key: "w1t-d3V",
                device_id: "postman",
                device_type: "postman",
            });

            const authToken = authTokenResponse.data.data.token;
            const loginResponse = await api.post(
                "/authorization/backoffice/login",
                { email, password },
                {
                    headers: {
                        token: authToken,
                    },
                }
            );

            const jwtToken = loginResponse.data.data.token; 
            localStorage.setItem("token", jwtToken);

            alert("Login berhasil!");
            navigate("/dashboard");
        } catch (err: unknown) {
            console.error("Response error:");
            alert("Email atau password salah!");
        }
    };

    return (
        <div className="flex h-screen items-center justify-center bg-gray-100">
            <div className="w-full max-w-md bg-white p-8 shadow-md rounded">
                <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block mb-1 font-medium">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            className="w-full border border-gray-300 rounded px-3 py-2"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block mb-1 font-medium">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            className="w-full border border-gray-300 rounded px-3 py-2"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="********"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
}
