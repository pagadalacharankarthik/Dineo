import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Dineo Privacy Policy — how we collect, use, and protect your data.",
};

export default function PrivacyPage() {
  const lastUpdated = "July 22, 2026";

  return (
    <div className="py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: {lastUpdated}</p>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          {[
            {
              title: "1. Information We Collect",
              content: `We collect information you provide directly to us when you create an account, update your profile, or build your digital menu. This includes:

• Name and email address
• Restaurant details (name, address, phone number, working hours)
• Menu data (categories, items, prices, descriptions, images)`,
            },
            {
              title: "2. How We Use Information",
              content: `We use the information we collect to:

• Provide, maintain, and improve our services
• Publish and serve your public digital menu page
• Authenticate your access to the merchant control panel
• Send you service updates, confirmations, and security alerts`,
            },
            {
              title: "3. Information Sharing",
              content: `We do not sell your personal information. Your public menu data (dishes, descriptions, prices, location, working hours) is shared publicly so customers can scan and view it. We may share internal account metrics with hosting and database sub-processors (like Neon and Better Auth) strictly to run the service.`,
            },
            {
              title: "4. Data Security",
              content: `We use industry-standard encryption protocols (SSL/HTTPS) to protect your account and data. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.`,
            },
            {
              title: "5. Cookies",
              content: `We use cookies to manage user sessions and preferences. These are essential for the platform to function. You can disable cookies in your browser settings, but some features may not work correctly.`,
            },
            {
              title: "6. Your Rights",
              content: `You have the right to access, correct, or delete your personal information at any time. You can do this through your account settings or by contacting us at charanlabssupport@gmail.com.`,
            },
            {
              title: "7. Contact Us",
              content: `If you have any questions about this Privacy Policy, please contact us at charanlabssupport@gmail.com.`,
            },
          ].map((section) => (
            <section key={section.title}>
              <h2 className="text-xl font-bold mb-3">{section.title}</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {section.content}
              </p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
