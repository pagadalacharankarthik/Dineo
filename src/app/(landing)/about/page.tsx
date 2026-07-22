import type { Metadata } from "next";
import { QrCode, Heart, Target, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about Dineo — our mission to help restaurants go digital.",
};

export default function AboutPage() {
  return (
    <div className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-6">
            Our mission is to help restaurants{" "}
            <span className="gradient-text">go digital</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Dineo was born from a simple idea — restaurant menus should be
            dynamic, not static. We built the platform we always wished existed.
          </p>
        </div>

        {/* Story */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="text-3xl font-bold mb-6">Our Story</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                We started Dineo after seeing restaurant owners struggle with
                expensive, inflexible printed menus. Every price change meant a
                new print run. Every new item required a redesign. It was costly
                and time-consuming.
              </p>
              <p>
                We believed there had to be a better way. So we built Dineo — a
                platform that lets restaurant owners create and manage beautiful
                digital menus that customers access by scanning a simple QR code.
              </p>
              <p>
                Today, hundreds of restaurants across India use Dineo to save
                money on printing, deliver better customer experiences, and update
                their menus instantly from any device.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Heart, label: "Built with love", value: "for restaurants" },
              { icon: Target, label: "Focused mission", value: "go digital" },
              { icon: Users, label: "Restaurants served", value: "500+" },
              { icon: QrCode, label: "QR codes generated", value: "10,000+" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="p-6 rounded-2xl border border-border bg-card text-center"
                >
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl gradient-primary mb-3">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-2xl font-bold gradient-text">{item.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Values */}
        <div className="rounded-3xl gradient-primary p-1">
          <div className="rounded-[22px] bg-background p-8 sm:p-12">
            <h2 className="text-3xl font-bold text-center mb-10">Our Values</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {[
                {
                  title: "Simplicity First",
                  desc: "We believe powerful tools should also be simple to use. If a restaurant owner can't use it in 5 minutes, we need to make it simpler.",
                },
                {
                  title: "Customer Obsessed",
                  desc: "Everything we build starts with the question: 'How does this help the restaurant owner and their customers?'",
                },
                {
                  title: "Always Improving",
                  desc: "We ship fast, learn fast, and improve fast. Your feedback directly shapes our product roadmap.",
                },
              ].map((v) => (
                <div key={v.title} className="text-center">
                  <h3 className="font-bold text-lg mb-3 gradient-text">{v.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
