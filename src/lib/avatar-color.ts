import {
    AVATAR_COLORS,
    type AvatarColor,
} from "@/types/user";

export function getAvatarColorFromUid(uid: string): AvatarColor {
    let hash = 0;

    for (const character of uid) {
        hash = (hash << 5) - hash + character.charCodeAt(0);
        hash |= 0;
    }

    const index = Math.abs(hash) % AVATAR_COLORS.length;

    return AVATAR_COLORS[index];
}