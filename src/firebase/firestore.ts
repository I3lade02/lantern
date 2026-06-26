"use client";

import { getFirestore } from "firebase/firestore";
import { firebaseApp } from "@/firebase/config";

export const firestoreDb = getFirestore(firebaseApp);