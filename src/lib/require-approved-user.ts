import {
  getFirebaseAdminAuth,
  getFirebaseAdminDb,
} from "@/lib/firebase-admin";

export type PartyRole = "admin" | "member";

export type ApprovedPartyUser = {
  id: string;
  email: string;
  displayName: string;
  role: PartyRole;
};

export class PollAuthorizationError extends Error {
  constructor(
    message: string,
    public readonly status: 401 | 403,
  ) {
    super(message);
    this.name = "PollAuthorizationError";
  }
}

function getBearerToken(request: Request): string | null {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  return authorization.slice("Bearer ".length).trim() || null;
}

export async function requireApprovedPartyUser(
  request: Request,
): Promise<ApprovedPartyUser> {
  const idToken = getBearerToken(request);

  if (!idToken) {
    throw new PollAuthorizationError(
      "Chybí přihlašovací token.",
      401,
    );
  }

  let decodedToken: Awaited<
    ReturnType<ReturnType<typeof getFirebaseAdminAuth>["verifyIdToken"]>
  >;

  try {
    decodedToken = await getFirebaseAdminAuth().verifyIdToken(
      idToken,
    );
  } catch {
    throw new PollAuthorizationError(
      "Přihlašovací token není platný.",
      401,
    );
  }

  const email = decodedToken.email?.trim();

  if (!email) {
    throw new PollAuthorizationError(
      "Účet nemá platný e-mail.",
      403,
    );
  }

  const firebaseAdminDb = getFirebaseAdminDb();

  const [allowlistSnapshot, profileSnapshot] =
    await Promise.all([
      firebaseAdminDb
        .collection("accessAllowlist")
        .doc(email)
        .get(),

      firebaseAdminDb
        .collection("users")
        .doc(decodedToken.uid)
        .get(),
    ]);

  if (!allowlistSnapshot.exists || !profileSnapshot.exists) {
    throw new PollAuthorizationError(
      "Tento účet nemá schválený přístup do LANternu.",
      403,
    );
  }

  const profile = profileSnapshot.data();
  const role = profile?.role;

  if (role !== "admin" && role !== "member") {
    throw new PollAuthorizationError(
      "Profil účtu nemá platnou roli.",
      403,
    );
  }

  const displayName =
    typeof profile?.displayName === "string" &&
    profile.displayName.trim()
      ? profile.displayName.trim()
      : email;

  return {
    id: decodedToken.uid,
    email,
    displayName,
    role,
  };
}

export async function requirePollAdmin(
  request: Request,
): Promise<ApprovedPartyUser> {
  const user = await requireApprovedPartyUser(request);

  if (user.role !== "admin") {
    throw new PollAuthorizationError(
      "Tuto akci může provést pouze admin.",
      403,
    );
  }

  return user;
}