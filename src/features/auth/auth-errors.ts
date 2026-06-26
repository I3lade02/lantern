import { FirebaseError } from "firebase/app";

export function getAuthErrorMessage(error: unknown): string {
    if (!(error instanceof FirebaseError)) {
        return "Něco se pokazilo. Zkus to prosím znovu";
    }

    switch (error.code) {
        case "auth/email-already-in-use":
            return "Tento email už v LANternu má účet";

        case "auth/invalid-email":
            return "Zadej platnou emailovou adresu";

        case "auth/invalid-credential":
        case "auth/wrong-password":
        case "auth/user-not-found":
            return "Email nebo heslo nesedí";
        
        case "auth/weak-password":
            return "Heslo je příliš slabé, Použil alespoň 8 znaků";

        case "auth/too-many-requests":
            return "Bylo příliš mnoho pokusů. Zkus to znovu později";

        case "auth/network-request-failed":
            return "Nepodařilo se spojit s Firebase. Zkontroluj připojení k internetu";
        
        default:
            return "Přihlášení se nepovedlo. Zkus to prosím znovu";
    }
}