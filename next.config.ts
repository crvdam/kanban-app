import type { NextConfig } from "next";

const nextConfig = {
    outputFileTracingIncludes: {
        "/**": ["./app/generated/prisma/**"],
        "/api/**": ["./app/generated/prisma/**"],
    },
};

export default nextConfig;
