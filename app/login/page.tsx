"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import Header from "@/app/components/Header/Header";
import styles from "./page.module.css";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        if (result.error) {
            setError("Invalid email or password");
            return;
        }

        window.location.href = "/dashboard";
    }

    return (
        <>
            <Header />
            <main className={styles.main}>
                <div className="genericFormContainer">
                    <h1>Login</h1>
                    <form className="genericForm" onSubmit={handleSubmit}>
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <br></br>
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        {error && <p>{error}</p>}
                        <br></br>
                        <button type="submit">Login</button>
                    </form>
                    <p>
                        Register a new account{" "}
                        <Link href={"/register"}>here.</Link>
                    </p>
                </div>
            </main>
        </>
    );
}
