import { createFileRoute } from "@tanstack/react-router";
import HeroSection from "@/components/site/HeroSection";
import IntroSection from "@/components/home/IntroSection";
import MissionVisionSection from "@/components/home/MissionVisionSection";
import ProgramsSection from "@/components/home/ProgramsSection";
import ImpactSection from "@/components/home/ImpactSection";
import ProjectsSection from "@/components/home/ProjectsSection";
import WhySupportSection from "@/components/home/WhySupportSection";
import CampaignSection from "@/components/home/CampaignSection";
import StoriesSection from "@/components/home/StoriesSection";
import InvolvementSection from "@/components/home/InvolvementSection";
import NewsletterSection from "@/components/home/NewsletterSection";
import { getCampaigns, getNewsPosts, getPrograms, getProjects, getPublicStats } from "@/lib/content-fns";

export const Route = createFileRoute("/_site/")({
  loader: async () => {
    const [programs, projects, stories, campaigns, stats] = await Promise.all([
      getPrograms(),
      getProjects(),
      getNewsPosts(),
      getCampaigns(),
      getPublicStats(),
    ]);
    return {
      programs: (programs || []).slice(0, 9),
      projects: (projects || []).slice(0, 3),
      stories: (stories || []).slice(0, 3),
      campaign: (campaigns || []).find((item) => item.is_featured) || (campaigns || [])[0] || null,
      stats: stats || {},
    };
  },
  head: () => ({
    meta: [
      { title: "Global Peace & Humanity Foundation — Together for Peace. Together for Humanity." },
      {
        name: "description",
        content:
          "GPHF is a Pakistan-registered humanitarian foundation working for peace, dignity and sustainable development through education, healthcare, clean water, food security and emergency relief.",
      },
      { property: "og:title", content: "Global Peace & Humanity Foundation" },
      {
        property: "og:description",
        content:
          "Together, we can build a better tomorrow. Support humanitarian programmes in Pakistan and worldwide.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { programs, projects, stories, campaign, stats } = Route.useLoaderData();

  return (
    <>
      <HeroSection />
      <IntroSection />
      <MissionVisionSection />
      {programs.length > 0 && <ProgramsSection programs={programs} />}
      <ImpactSection stats={stats} />
      {projects.length > 0 && <ProjectsSection projects={projects} />}
      <WhySupportSection />
      <CampaignSection campaign={campaign} />
      {stories.length > 0 && <StoriesSection stories={stories} />}
      <InvolvementSection />
      <NewsletterSection />
    </>
  );
}