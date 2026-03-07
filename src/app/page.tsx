import { Hero } from "@/widgets/home/ui/Hero";
import { PlatformSections } from "@/widgets/home/ui/PlatformSections";
import { Features } from "@/widgets/home/ui/Features";
import { Tours } from "@/widgets/home/ui/Tours";
import { PopularCourses } from "@/widgets/home/ui/PopularCourses";
import { Testimonials } from "@/widgets/home/ui/Testimonials";
import { Newsletter } from "@/widgets/home/ui/Newsletter";
import { getTours } from "@/shared/api/tourApi";
import { getTestimonials } from "@/shared/api/testimonialApi";

export default async function Home() {
  const [tours, testimonials] = await Promise.all([
    getTours().catch(() => []),
    getTestimonials().catch(() => []),
  ]);

  return (
    <main>
      <Hero />
      <PlatformSections />
      <PopularCourses />
      <Features />
      <Tours initialTours={tours} />
      <Testimonials initialTestimonials={testimonials} />
      <Newsletter />
    </main>
  );
}
