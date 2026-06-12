import {
    getToken,
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging.js";

import { messaging } from "../configs/firebase";

import { supabase } from "../configs/supbase";

export const registerPush =
    async (userId) => {

        try {

            const permission =
                await Notification.requestPermission();

            if (
                permission !== "granted"
            ) {
                return;
            }

            const token =
                await getToken(
                    messaging,

                    {
                        vapidKey:
                            "BFgLWHyI_-MmEQ87nW7hRuwFXEgZ663x_pPnY39lAPixlvRvTqmgberrPQCoZg_uKWUG00vaA0lHCyXJa-AwNEs",
                    }
                );

            if (!token) return;

            await supabase
                .from("user_push_tokens")
                .upsert(
                    {
                        user_id: userId,
                        token,
                    },
                    {
                        onConflict: "user_id",
                    }
                );


            console.log(
                "Push token saved"
            );

        } catch (err) {

            console.log(err);

        }
    };