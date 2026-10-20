import Link from "next/link";
import { ArrowRight, Building2, GraduationCap, Sparkles, Users } from "lucide-react";
import { Header } from "@/components/Header";
import { Orb } from "@/components/Orb";

const experiences = [
  { href: "/student", title: "I’m a student", subtitle: "Learn with Jinso", icon: GraduationCap, color: "teal" },
  { href: "/teacher", title: "I’m a teacher", subtitle: "Understand your classroom", icon: Users, color: "blue" },
  { href: "/institution", title: "I lead an institution", subtitle: "See learning at scale", icon: Building2, color: "gold" },
  { href: "/ask-jinso", title: "Ask Jinso Anything", subtitle: "Explore how Jinso could help you", icon: Sparkles, color: "violet" },
];

export default function WelcomePage() {
  return <main className="welcome-page">
    <Header />
    <div className="welcome-glow" />
    <div className="welcome-content">
      <section className="welcome-hero">
        <Orb state="idle" brandIcon />
        <span className="orb-caption"><i /> Jinso is ready</span>
        <h1>Ask. Explore. See what Jinso can do.</h1>
        <p>Step inside a live, interactive view of learning intelligence—for learners, teachers, and institutions.</p>
      </section>
      <nav className="experience-grid" aria-label="Choose an experience">
        {experiences.map(({ href, title, subtitle, icon: Icon, color }) => <Link href={href} className={`experience-card experience-card--${color} focus-ring`} key={href}>
          <span className="experience-icon"><Icon size={23} /></span><span><strong>{title}</strong><small>{subtitle}</small></span><span className="experience-arrow"><ArrowRight size={18} /></span>
        </Link>)}
      </nav>
    </div>
  </main>;
}
