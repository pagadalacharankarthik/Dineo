import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Dineo Terms and Conditions — rules and guidelines for using our platform.",
};

export default function TermsPage() {
  const lastUpdated = "July 22, 2026";

  return (
    <div className="py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold mb-4">Terms &amp; Conditions</h1>
          <p className="text-muted-foreground">Last updated: {lastUpdated}</p>
        </div>

        <div className="space-y-8">
          {[
            {
              title: "1. Acceptance of Terms",
              content: `By accessing or using Dineo, you agree to be bound by these Terms and Conditions. If you disagree with any part of the terms, you may not access the service.`,
            },
            {
              title: "2. Use of Service",
              content: `Dineo provides a platform for restaurant owners to create and manage digital menus. You agree to use the service only for lawful purposes and in accordance with these terms.

You must not:
• Use the service in any way that violates applicable laws
• Transmit any unsolicited promotional material
• Attempt to gain unauthorized access to any part of the service
• Use the service to harm others`,
            },
            {
              title: "3. Account Responsibilities",
              content: `You are responsible for maintaining the confidentiality of your account credentials. You are responsible for all activities that occur under your account. Notify us immediately of any unauthorized use.`,
            },
            {
              title: "4. Content",
              content: `You retain ownership of content you upload to Dineo (menu items, images, descriptions). By uploading content, you grant Dineo a license to display that content as part of the service. You are responsible for ensuring your content does not violate any laws or third-party rights.`,
            },
            {
              title: "5. Service Availability",
              content: `We strive for 99.9% uptime but do not guarantee uninterrupted access. We may perform maintenance that temporarily interrupts the service. We are not liable for any loss resulting from service interruptions.`,
            },
            {
              title: "6. Termination",
              content: `We reserve the right to terminate or suspend your account for violations of these terms. You may terminate your account at any time through account settings.`,
            },
            {
              title: "7. Limitation of Liability",
              content: `Dineo is not liable for any indirect, incidental, or consequential damages arising from your use of the service. Our liability is limited to the amount you have paid for the service.`,
            },
            {
              title: "8. Changes to Terms",
              content: `We reserve the right to modify these terms at any time. We will notify users of significant changes via email. Continued use of the service after changes constitutes acceptance.`,
            },
            {
              title: "9. Contact",
              content: `For questions about these Terms, contact us at charanlabssupport@gmail.com.`,
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
