import type { DecodedIdToken } from "firebase-admin/auth";

import {
  getFirebaseAdminAuth,
  getFirebaseAdminDb,
} from "@/lib/firebase-admin";

export class ApiAuthorizationError extends Error {
    constructor(
        message: string,
        public readonly status: 401 | 403 = 401,
    ) {
        super(message);

        this.name = "ApiAuthorizationError";
    }
}

export type AdminActor = {
    id: string;
    email: string | null;
    displayName: string;
    token: DecodedIdToken;
};

function getBearerToken(request: Request): string {
    const authorization = request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
        throw new ApiAuthorizationError(
            "Chybí přihlašovací token",
            401,
        );
    }

    const token = authorization.slice("Bearer ".length).trim();

    if (!token) {
        throw new ApiAuthorizationError(
            "Přihlašovací token je prázdný",
            401,
        );
    }

    return token;
}

export async function requireAdmin(
    request: Request,
): Promise<AdminActor> {
    const idToken = getBearerToken(request);

    let decodedToken: DecodedIdToken;

    try {
        decodedToken = await getFirebaseAdminAuth().verifyIdToken(idToken);
    } catch {
        throw new ApiAuthorizationError(
            "Přihlašovací token není platný",
            401,
        );
    }

    const profileSnapshot = await getFirebaseAdminDb()
        .collection("users")
        .doc(decodedToken.uid)
        .get();
    
    if (!profileSnapshot.exists) {
        throw new ApiAuthorizationError(
            "Admin profil nebyl nalezen",
            403,
        );
    }

    const profile = profileSnapshot.data();

    if (profile?.role !== "admin") {
        throw new ApiAuthorizationError(
            "Tuto akci může provést pouze admin",
            403,
        );
    }

    const profileDisplayName =
        typeof profile.displayName === "string"
            ? profile.displayName.trim()
            : "";

    return {
        id: decodedToken.uid,
        email: decodedToken.email ?? null,
        displayName:
            profileDisplayName || 
            decodedToken.email?.split("@")[0] ||
            "Admin",
        token: decodedToken,
    };
}