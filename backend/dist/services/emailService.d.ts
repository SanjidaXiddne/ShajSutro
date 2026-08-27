export declare const sendVerificationEmail: (email: string, code: string) => Promise<void>;
export declare const sendPasswordResetEmail: (email: string, code: string) => Promise<void>;
export declare const sendOrderConfirmationEmail: (recipientEmail: string, order: any) => Promise<void>;
export declare const sendNewsletterWelcomeEmail: (email: string) => Promise<void>;
export interface IBroadcastMailPayload {
    recipientEmails: string[];
    subject: string;
    badgeText?: string;
    title: string;
    messageBody: string;
    bannerImageUrl?: string;
    ctaButtonText?: string;
    ctaButtonUrl?: string;
}
export declare const sendBroadcastEmail: (payload: IBroadcastMailPayload) => Promise<{
    sentCount: number;
    failedCount: number;
}>;
//# sourceMappingURL=emailService.d.ts.map