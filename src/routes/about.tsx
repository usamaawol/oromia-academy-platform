import { createFileRoute } from "@tanstack/react-router";
import {
  Mail,
  GraduationCap,
  Bot,
  Sparkles,
  Target,
  Users,
  BookOpen,
  Award,
  Heart,
  ArrowRight,
  MessageCircle,
  Globe,
} from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n, localized } from "@/i18n";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — Oromia Academy" },
      {
        name: "description",
        content:
          "Learn about Oromia Academy — practical technology and AI education in Afaan Oromoo and English. Contact us at oromiaacademy@gmail.com.",
      },
      { property: "og:title", content: "About Us — Oromia Academy" },
      {
        property: "og:description",
        content:
          "Oromia Academy provides hands-on technology and AI training for the Oromo community.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { t, lang } = useI18n();

  const isOm = lang === "om";

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <section className="surface-hero relative overflow-hidden">
          <div className="grid-glow absolute inset-0 opacity-40" />
          <div className="relative mx-auto w-full max-w-6xl px-4 py-20 md:py-28">
            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-1.5 text-sm font-medium">
                <Heart className="size-4" />
                {isOm
                  ? "Waa'ee Oromia Academy"
                  : "About Oromia Academy"}
              </div>
              <h1 className="text-4xl font-bold leading-tight md:text-6xl">
                {isOm
                  ? "Teeknooloojii fi AI — Afaan Keetiiin Baradhuu"
                  : "Learn Technology & AI — In Your Language"}
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-primary-foreground/85 md:text-lg">
                {isOm
                  ? "Oromia Academy bakka barattoota Oromoo teeknooloojii, Artificial Intelligence (AI) fi gara fuulduraatti gaafatanitti hima. Barnoonni keenya gochaan, Afaan Oromootiin, akkasumas English keessatti ni himama."
                  : "Oromia Academy is where the Oromo community comes to learn technology, artificial intelligence, and future-ready skills — hands-on, in Afaan Oromoo, with English also available."}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  asChild
                  size="lg"
                  className="bg-background text-foreground hover:bg-background/90"
                >
                  <a href="mailto:oromiaacademy@gmail.com">
                    <Mail className="mr-2 size-5" />
                    oromiaacademy@gmail.com
                  </a>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                >
                  <a href="#mission">
                    {isOm ? "Yaada Keenya Ilaali" : "Discover Our Mission"}
                    <ArrowRight className="ml-2 size-4" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section
          id="mission"
          className="mx-auto w-full max-w-6xl px-4 py-20"
        >
          <div className="grid gap-10 md:grid-cols-2 md:items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">
                {isOm ? "Yaada fi Misiina Keenya" : "Our Mission & Vision"}
              </p>
              <h2 className="mt-2 text-3xl font-bold md:text-4xl">
                {isOm
                  ? "Barattoota Oromoo teeknooloojii irraa deebi'uuf qopheessuuf."
                  : "Empowering the Oromo community through technology."}
              </h2>
              <p className="mt-5 leading-7 text-muted-foreground md:text-lg">
                {isOm
                  ? "Misiina keenya namni Oromoo teeknooloojii fi AI dandeettii qabaachuuf, iddoo gargaaruu fi barnoota gochaa kennuudha. Osoo gosa, barnoota, booda deemtuu hamus ta'uu qaba jedhee waan dhagaynu irraan garee garaa caalaa bu'aa qabu kennuuf qophii jira."
                  : "Our mission is simple — give every Oromo learner a fair shot at the future by providing practical, hands-on technology and AI education that actually works. No empty theory; just real tools, real projects, and real skills you can use starting today."}
              </p>
              <div className="mt-8 space-y-4">
                {[
                  {
                    icon: Target,
                    title: isOm ? "Fayyaa baradhaa" : "Excellence in teaching",
                    body: isOm
                      ? "Barnoota calaaqaa, gochaa, fi sirriitti himama."
                      : "Structured, high-quality, practical training programs.",
                  },
                  {
                    icon: Globe,
                    title: isOm ? "Afaan keetiiin" : "In your language",
                    body: isOm
                      ? "Afaan Oromootiin himama, English akka bakka bu'aa ni argama."
                      : "Taught primarily in Afaan Oromoo, with English as a secondary medium.",
                  },
                  {
                    icon: Award,
                    title: isOm ? "Qormaata nageenyaa" : "Secure certification",
                    body: isOm
                      ? "Qormaata dijitaalaa nageenyaa fi bu'aa ni argachuuf qophii jira."
                      : "Protected digital exams with verifiable results.",
                  },
                ].map(({ icon: Ic, title, body }) => (
                  <div key={title} className="flex items-start gap-4">
                    <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                      <Ic className="size-5" />
                    </div>
                    <div>
                      <p className="font-semibold">{title}</p>
                      <p className="mt-0.5 text-sm leading-6 text-muted-foreground">
                        {body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid gap-4 md:mt-4">
              <Card className="overflow-hidden border-primary/20 shadow-soft">
                <CardContent className="p-6">
                  <Users className="size-8 text-primary" />
                  <h3 className="mt-4 text-2xl font-bold">
                    {isOm ? "Barattoota Gargaaruu" : "For Every Student"}
                  </h3>
                  <p className="mt-2 leading-7 text-muted-foreground">
                    {isOm
                      ? "Yeroo kamiyyuu, nama kamiyyuu fi gosa kamiyyuu barachuuf danda'a. Barattoonni bilbila keessan gaaffii gaarii kennanii itti fufuudha."
                      : "Whether you're a complete beginner or you already know some tech, our programs meet you exactly where you are. You can learn from your phone, no fancy laptop required."}
                  </p>
                </CardContent>
              </Card>
              <Card className="overflow-hidden shadow-soft">
                <CardContent className="p-6">
                  <Bot className="size-8 text-primary" />
                  <h3 className="mt-4 text-2xl font-bold">
                    {isOm ? "AI fi Future Tech" : "AI & Future-Ready Skills"}
                  </h3>
                  <p className="mt-2 leading-7 text-muted-foreground">
                    {isOm
                      ? "Suuraa AI, fiidiyoo, Telegram bootii, fi iddoo gaarii kaayyoo hojjennaan garee gara caalaa bu'aa buusuuf qophii jira."
                      : "We cover AI image & video editing, earning through Telegram, building AI-powered Telegram bots, and everything in between — genuinely useful skills for the economy coming."}
                  </p>
                </CardContent>
              </Card>
              <Card className="overflow-hidden shadow-soft">
                <CardContent className="p-6">
                  <BookOpen className="size-8 text-primary" />
                  <h3 className="mt-4 text-2xl font-bold">
                    {isOm ? "Barnoota Gochaa" : "Hands-On, Practical Courses"}
                  </h3>
                  <p className="mt-2 leading-7 text-muted-foreground">
                    {isOm
                      ? "Yaada qofa osoo hin ta'uu, meeshaalee dhugaa irratti hojjennaan garii galmeessu."
                      : "You don't just hear about it — you do it. Every lesson pairs explanation with a real exercise you complete on the spot."}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="border-y bg-muted/40">
          <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-16 md:grid-cols-4">
            {[
              { icon: GraduationCap, value: "3+", label: t("landing.statsCourses") },
              { icon: Users, value: "100+", label: t("landing.statsStudents") },
              { icon: Award, value: "3", label: t("landing.statsExams") },
              { icon: Sparkles, value: "100%", label: isOm ? "Barnoota Gochaa" : "Practical Learning" },
            ].map(({ icon: Ic, value, label }) => (
              <div key={label} className="text-center">
                <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-card shadow-soft">
                  <Ic className="size-6 text-primary" />
                </div>
                <div className="mt-4 text-4xl font-black tracking-tight">{value}</div>
                <div className="mt-1 text-sm font-medium text-muted-foreground">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-4xl px-4 py-20 text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-3xl bg-gradient-to-br from-primary to-primary-glow text-primary-foreground shadow-glow">
            <Mail className="size-8" />
          </div>
          <h2 className="mt-6 text-3xl font-bold md:text-4xl">
            {isOm ? "Nu Qunnami" : "Get In Touch"}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">
            {isOm
              ? "Barnoota keenya, galmaa'uuf, ykn gaaffii qabaachuu dandeessu. Maaloo gara imeelii keessatti nu qunnami — nuun ofii sirritti deebi'a."
              : "Have questions about our courses, enrollment, or how Oromia Academy can help you? We'd love to hear from you. Send us an email and we will get back to you personally."}
          </p>
          <div className="mt-10">
            <Card className="mx-auto max-w-xl overflow-hidden border-primary/20 shadow-soft">
              <CardContent className="p-8">
                <div className="grid size-14 mx-auto place-items-center rounded-2xl bg-primary/10">
                  <MessageCircle className="size-7 text-primary" />
                </div>
                <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {isOm ? "Imeelii Qunnamuu" : "Contact Email"}
                </p>
                <a
                  href="mailto:oromiaacademy@gmail.com"
                  className="mt-1 block text-2xl font-bold text-primary hover:underline break-all"
                >
                  oromiaacademy@gmail.com
                </a>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {isOm
                    ? "Imeelii kana irratti gaaffilee, galmaa'uuf fi gargaarsa baradhaa nu qunnami."
                    : "Reach out to us here for any questions, registrations, or support. We reply to every message."}
                </p>
                <Button asChild size="lg" className="mt-6 w-full">
                  <a href="mailto:oromiaacademy@gmail.com">
                    <Mail className="mr-2 size-5" />
                    {isOm ? "Imeelii Ergi" : "Send us an Email"}
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <footer className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span>© 2026 Oromia Academy</span>
        <a
          href="mailto:oromiaacademy@gmail.com"
          className="hover:text-foreground transition-colors"
        >
          oromiaacademy@gmail.com
        </a>
      </footer>
    </div>
  );
}
