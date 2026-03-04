export interface NavItem {
  label: string;
  href?: string;
  children?: NavItem[];
}

export const getNavigationConfig = (t: any): NavItem[] => [
  {
    label: t.nav.courses,
    children: [
      { label: t.nav.coursesBeginners, href: "/courses-beginners" },
      { label: t.nav.coursesMeditation, href: "/courses-meditation" },
      { label: t.nav.coursesBack, href: "/courses-back" },
      { label: t.nav.coursesWomen, href: "/courses-women" },
    ],
  },
  {
    label: t.nav.consultations,
    children: [
      { label: t.nav.consultPrivate, href: "/consultations-private" },
      { label: t.nav.consultNutrition, href: "/consultations-nutrition" },
      { label: t.nav.consultMentorship, href: "/consultations-mentorship" },
    ],
  },
  {
    label: t.nav.blog,
    children: [
      { label: t.nav.blogArticles, href: "/blog-articles" },
      { label: t.nav.blogVideos, href: "/blog-videos" },
      { label: t.nav.blogPodcasts, href: "/blog-podcasts" },
      { label: t.nav.blogRecipes, href: "/blog-recipes" },
    ],
  },
  {
    label: t.nav.tours,
    href: "/tours",
  },
  {
    label: t.nav.about,
    href: "/about",
  },
  {
    label: t.nav.faq,
    href: "/faq",
  },
  {
    label: t.nav.contact,
    href: "/contact",
  }
];