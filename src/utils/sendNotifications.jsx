import {
    onMessage,
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging.js";

import { messaging } from "../configs/firebase";

/* export const listenNotifications =
    () => {

        onMessage(
            messaging,

            (payload) => {

                new Notification(

                    payload.notification
                        ?.title ||

                    "New Message",

                    {
                        body:
                            payload.notification
                                ?.body,
                        icon:
                            "/icon.png",
                    }
                );
            }
        );
    };
 */

export const sendNotification =
    async ({
        title,
        body,
    }) => {

        if (
            Notification.permission !==
            "granted"
        ) {
            return;
        }

        new Notification(
            title,
            {
                body,
                icon: "/icon.png",
            }
        );
    }; 