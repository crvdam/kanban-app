"use client";

import { useState } from "react";
import Header from "@/app/components/Header/Header";
import Link from "next/link";
import styles from "./page.module.css";

export default function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const response = await fetch("/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            setError(data.error);
            return;
        }

        window.location.href = "/login";
    }

    return (
        <>
            <Header />
            <main className={styles.main}>
                <div className="genericFormContainer">
                    <h1>Register</h1>
                    <form className="genericForm" onSubmit={handleSubmit}>
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        {error && <p>{error}</p>}
                        <button type="submit">Register</button>
                    </form>
                    <p>
                        Already have an account?{" "}
                        <Link href={"/login"}>Login here</Link>
                    </p>
                </div>
            </main>
        </>
    );
}
