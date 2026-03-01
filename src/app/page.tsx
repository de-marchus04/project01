import { Hero } from "@/widgets/home/ui/Hero";
import { PlatformSections } from "@/widgets/home/ui/PlatformSections";
import { Features } from "@/widgets/home/ui/Features";
import { Tours } from "@/widgets/home/ui/Tours";
import { PopularCourses } from "@/widgets/home/ui/PopularCourses";
import { Testimonials } from "@/widgets/home/ui/Testimonials";
import { Newsletter } from "@/widgets/home/ui/Newsletter";

export default function Home() {
  return (
    <main>
      <Hero />
      <PlatformSections />
      <PopularCourses />
      <Features />
      <Tours />
      <Testimonials />
      <Newsletter />
    </main>
  );
}
