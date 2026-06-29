import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";

import {
  getFirebaseAdminAuth,
  getFirebaseAdminDb,
} from "@/lib/firebase-admin";
import {
  ApiAuthorizationError,
  requireAdmin,
} from "@/lib/require-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    uid: string;
  }>;
};

type JoinRequestAction = "approve" | "reject";

type PendingJoinRequestData = {
  id: string;
  email: string;
  displayName: string;
  status: "pending";
};

const avatarColors = [
  "amber",
  "moss",
  "wine",
  "cream",
] as const;

function jsonError(
  message: string,
  status: number,
) {
  return NextResponse.json(
    {
      ok: false,
      error: message,
    },
    {
      status,
    },
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getText(
  value: unknown,
  minimumLength: number,
  maximumLength: number,
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();
  const length = Array.from(trimmedValue).length;

  if (length < minimumLength || length > maximumLength) {
    return null;
  }

  return trimmedValue;
}

function getDefaultAvatarColor(
  userId: string,
): (typeof avatarColors)[number] {
  let hash = 0;

  for (const character of userId) {
    hash = (hash * 31 + character.charCodeAt(0)) | 0;
  }

  return avatarColors[Math.abs(hash) % avatarColors.length];
}

function getJoinRequestAction(
  body: unknown,
): JoinRequestAction | null {
  if (!isRecord(body)) {
    return null;
  }

  const action = body.action;

  if (action === "approve" || action === "reject") {
    return action;
  }

  return null;
}

function parsePendingJoinRequest(
  data: Record<string, unknown>,
  uid: string,
): PendingJoinRequestData | null {
  const id = getText(data.id, 1, 128);
  const email = getText(data.email, 3, 254);
  const displayName = getText(data.displayName, 2, 24);

  if (
    id !== uid ||
    !email ||
    !displayName ||
    data.status !== "pending"
  ) {
    return null;
  }

  return {
    id,
    email,
    displayName,
    status: "pending",
  };
}

function hasErrorCode(
  error: unknown,
  code: string,
): boolean {
  return (
    isRecord(error) &&
    typeof error.code === "string" &&
    error.code === code
  );
}

export async function POST(
  request: Request,
  context: RouteContext,
) {
  try {
    const admin = await requireAdmin(request);

    const { uid } = await context.params;

    if (!uid || uid.length > 128) {
      return jsonError("Neplatné ID žádosti.", 400);
    }

    const body: unknown = await request.json().catch(() => null);

    const action = getJoinRequestAction(body);

    if (!action) {
      return jsonError(
        "Akce musí být approve nebo reject.",
        400,
      );
    }

    const joinRequestRef = getFirebaseAdminDb()
      .collection("joinRequests")
      .doc(uid);

    const userProfileRef = getFirebaseAdminDb()
      .collection("users")
      .doc(uid);

    const notificationStateRef = userProfileRef
      .collection("notificationState")
      .doc("main");

    const joinRequestSnapshot = await joinRequestRef.get();

    if (!joinRequestSnapshot.exists) {
      return jsonError(
        "Žádost o připojení nebyla nalezena.",
        404,
      );
    }

    const joinRequest = parsePendingJoinRequest(
      joinRequestSnapshot.data() ?? {},
      uid,
    );

    if (!joinRequest) {
      return jsonError(
        "Žádost už není ve stavu čekajícího schválení.",
        409,
      );
    }

    if (action === "reject") {
      try {
        await getFirebaseAdminAuth().deleteUser(uid);
      } catch (error) {
        if (!hasErrorCode(error, "auth/user-not-found")) {
          throw error;
        }
      }

      const cleanupBatch = getFirebaseAdminDb().batch();

      cleanupBatch.delete(joinRequestRef);
      cleanupBatch.delete(userProfileRef);
      cleanupBatch.delete(notificationStateRef);

      await cleanupBatch.commit();

      return NextResponse.json({
        ok: true,
        action: "rejected",
      });
    }

    let applicant;

    try {
      applicant = await getFirebaseAdminAuth().getUser(uid);
    } catch (error) {
      if (hasErrorCode(error, "auth/user-not-found")) {
        return jsonError(
          "Účet žadatele už ve Firebase Authentication neexistuje.",
          409,
        );
      }

      throw error;
    }

    const applicantEmail = applicant.email?.trim().toLowerCase();

    if (!applicantEmail) {
      return jsonError(
        "Účet žadatele nemá platný e-mail.",
        409,
      );
    }

    if (!applicant.emailVerified) {
      return jsonError(
        "Žadatel nejdřív musí ověřit svůj e-mail.",
        409,
      );
    }

    if (
      applicantEmail.toLocaleLowerCase("cs-CZ") !==
      joinRequest.email.toLocaleLowerCase("cs-CZ")
    ) {
      return jsonError(
        "E-mail žádosti neodpovídá Firebase účtu žadatele.",
        409,
      );
    }

    const existingProfileSnapshot =
      await userProfileRef.get();

    const existingProfile = existingProfileSnapshot.data();

    if (existingProfile?.role === "admin") {
      return jsonError(
        "Tento účet už má admin profil a nelze jej schválit jako novou žádost.",
        409,
      );
    }

    const allowlistRef = getFirebaseAdminDb()
      .collection("accessAllowlist")
      .doc(applicantEmail);

    const activityRef = getFirebaseAdminDb()
      .collection("activityLog")
      .doc();

    const approvalBatch = getFirebaseAdminDb().batch();

    approvalBatch.set(
      allowlistRef,
      {
        id: applicantEmail,
        email: applicantEmail,
        approved: true,
        approvedAt: FieldValue.serverTimestamp(),
        approvedById: admin.id,
        approvedByName: admin.displayName,
        updatedAt: FieldValue.serverTimestamp(),
      },
      {
        merge: true,
      },
    );

    approvalBatch.set(
      userProfileRef,
      {
        id: uid,
        displayName: joinRequest.displayName,
        email: applicantEmail,
        avatarColor: getDefaultAvatarColor(uid),
        role: "member",
        createdAt:
          existingProfile?.createdAt ??
          FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      {
        merge: true,
      },
    );

    approvalBatch.set(
      joinRequestRef,
      {
        status: "approved",
        reviewedAt: FieldValue.serverTimestamp(),
        reviewedById: admin.id,
        reviewedByName: admin.displayName,
        updatedAt: FieldValue.serverTimestamp(),
      },
      {
        merge: true,
      },
    );

    approvalBatch.set(activityRef, {
      id: activityRef.id,
      type: "member_joined",
      actorId: admin.id,
      actorName: admin.displayName,
      message: `${admin.displayName} schválil připojení člena ${joinRequest.displayName}.`,
      sessionId: null,
      createdAt: FieldValue.serverTimestamp(),
    });

    await approvalBatch.commit();

    return NextResponse.json({
      ok: true,
      action: "approved",
    });
  } catch (error) {
    if (error instanceof ApiAuthorizationError) {
      return jsonError(error.message, error.status);
    }

    console.error(
      "Join request admin endpoint selhal:",
      error,
    );

    return jsonError(
      "Serveru se nepodařilo zpracovat žádost o připojení.",
      500,
    );
  }
}