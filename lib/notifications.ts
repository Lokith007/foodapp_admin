export interface SOSPayload {
    title: string;
    body: string;
    data?: any;
}

export const sendSOSNotificationToContacts = async (
    tokens: string[],
    payload: SOSPayload
): Promise<{ success: boolean; error?: string }> => {
    if (tokens.length === 0) return { success: false, error: "No tokens provided" };

    const messages = tokens.map((token) => ({
        to: token,
        sound: "default",
        title: payload.title,
        body: payload.body,
        data: payload.data,
        priority: "high",
    }));

    try {
        const response = await fetch("https://exp.host/--/api/v2/push/send", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Accept-encoding": "gzip, deflate",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(messages),
        });

        const data = await response.json();
        console.log("Expo Push Response:", data);

        return { success: true };
    } catch (error: any) {
        console.error("Error sending push notifications:", error);
        return { success: false, error: error.message };
    }
};
