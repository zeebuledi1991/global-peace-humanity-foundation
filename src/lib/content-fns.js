import { createServerFn } from "@tanstack/react-start";

const list = (res) => (Array.isArray(res) ? res : res?.items ?? []);

async function verifiedDonations(base44) {
  const res = await base44.asServiceRole.entities.Donation.filter({ status: "completed" }, { limit: 500 });
  return list(res);
}

export const getPrograms = createServerFn({ method: "GET" }).handler(async ({ context }) => {
  const base44 = context.getBase44();
  const res = await base44.entities.Program.filter(
    { is_published: true },
    { sort: "display_order", limit: 100 }
  );
  return list(res);
});

export const getProgramBySlug = createServerFn({ method: "GET" })
  .inputValidator((data) => data)
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44();
    const res = await base44.entities.Program.filter(
      { slug: String(data?.slug || ""), is_published: true },
      { limit: 1 }
    );
    return list(res)[0] ?? null;
  });

export const getProjects = createServerFn({ method: "GET" }).handler(async ({ context }) => {
  const base44 = context.getBase44();
  const [res, donations] = await Promise.all([
    base44.entities.Project.filter({ is_published: true }, { sort: "created_date", limit: 100 }),
    verifiedDonations(base44),
  ]);
  const raised = donations.reduce((acc, donation) => {
    if (donation.project_id) {
      acc[donation.project_id] = (acc[donation.project_id] || 0) + (Number(donation.amount) || 0);
    }
    return acc;
  }, {});
  return list(res).map((project) => ({ ...project, raised_amount: raised[project.id] || 0 }));
});

export const getProjectById = createServerFn({ method: "GET" })
  .inputValidator((data) => data)
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44();
    const id = String(data?.id || "");
    if (!id) return null;
    let project = null;
    try {
      project = await base44.entities.Project.get(id);
    } catch (error) {
      if (error?.status === 404) return null;
      throw error;
    }
    if (!project || project.is_published === false) return null;
    const donations = await verifiedDonations(base44);
    const raised = donations
      .filter((donation) => donation.project_id === id)
      .reduce((sum, donation) => sum + (Number(donation.amount) || 0), 0);
    return { ...project, raised_amount: raised };
  });

export const getCampaigns = createServerFn({ method: "GET" }).handler(async ({ context }) => {
  const base44 = context.getBase44();
  const [res, donations] = await Promise.all([
    base44.entities.Campaign.filter({ is_active: true }, { sort: "created_date", limit: 50 }),
    verifiedDonations(base44),
  ]);
  const raised = donations.reduce((acc, donation) => {
    if (donation.campaign_id) {
      acc[donation.campaign_id] = (acc[donation.campaign_id] || 0) + (Number(donation.amount) || 0);
    }
    return acc;
  }, {});
  return list(res).map((campaign) => ({ ...campaign, raised_amount: raised[campaign.id] || 0 }));
});

export const getNewsPosts = createServerFn({ method: "GET" }).handler(async ({ context }) => {
  const base44 = context.getBase44();
  const res = await base44.entities.NewsPost.filter(
    { is_published: true },
    { sort: "-published_date", limit: 100 }
  );
  return list(res);
});

export const getNewsPostBySlug = createServerFn({ method: "GET" })
  .inputValidator((data) => data)
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44();
    const res = await base44.entities.NewsPost.filter(
      { slug: String(data?.slug || ""), is_published: true },
      { limit: 1 }
    );
    return list(res)[0] ?? null;
  });

export const getGalleryItems = createServerFn({ method: "GET" }).handler(async ({ context }) => {
  const base44 = context.getBase44();
  const res = await base44.entities.GalleryItem.filter(
    { is_published: true },
    { sort: "display_order", limit: 100 }
  );
  return list(res);
});

export const getDocuments = createServerFn({ method: "GET" }).handler(async ({ context }) => {
  const base44 = context.getBase44();
  const res = await base44.entities.Document.filter(
    { is_published: true },
    { sort: "-published_date", limit: 100 }
  );
  return list(res);
});

export const getSiteSettings = createServerFn({ method: "GET" }).handler(async ({ context }) => {
  const base44 = context.getBase44();
  const res = await base44.entities.SiteSettings.list({ limit: 1 });
  return list(res)[0] ?? null;
});

export const getPublicStats = createServerFn({ method: "GET" }).handler(async ({ context }) => {
  const base44 = context.getBase44();
  const [programs, projects, documents, stories] = await Promise.all([
    base44.entities.Program.count({ is_published: true }),
    base44.entities.Project.count({ is_published: true }),
    base44.entities.Document.count({ is_published: true }),
    base44.entities.NewsPost.count({ is_published: true }),
  ]);
  return { programs, projects, documents, stories };
});