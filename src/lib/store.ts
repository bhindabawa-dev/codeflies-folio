import prisma from "./prisma";
import { Project, User, UserRole, UserStatus } from "./types";

const INITIAL_PROJECTS: Project[] = [
  {
    id: "proj_1",
    title: "PayStream",
    url: "https://paystream.codeflies-showcase.io",
    description: "PayStream: Next-gen treasury handling multi-currency Stripe workflows. Live: https://paystream.codeflies-showcase.io",
    techStack: ["Next.js 14", "Stripe API"],
    tags: ["#Fintech"],
    order: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "proj_2",
    title: "HealthPulse",
    url: "https://healthpulse.codeflies-showcase.io",
    description: "HealthPulse: Certified HIPAA architecture with WebRTC video. Live: https://healthpulse.codeflies-showcase.io",
    techStack: ["React Native", "WebRTC"],
    tags: ["#Healthcare"],
    order: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "proj_3",
    title: "LuxeHaven",
    url: "https://luxehaven.codeflies-showcase.io",
    description: "LuxeHaven: 60FPS WebGL architectural visualization. Live: https://luxehaven.codeflies-showcase.io",
    techStack: ["Three.js", "WebGL"],
    tags: ["#WebGL"],
    order: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "proj_4",
    title: "Omnikart",
    url: "https://omnikart.codeflies-showcase.io",
    description: "Omnikart: Headless Shopify Plus store with 99 Lighthouse score. Live: https://omnikart.codeflies-showcase.io",
    techStack: ["Shopify Plus", "Hydrogen"],
    tags: ["#ECommerce"],
    order: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "proj_5",
    title: "CloudMetrics",
    url: "https://cloudmetrics.codeflies-showcase.io",
    description: "CloudMetrics: Real-time DevOps analytics handling 10M events/sec. Live: https://cloudmetrics.codeflies-showcase.io",
    techStack: ["React 18", "ClickHouse"],
    tags: ["#SaaS"],
    order: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "proj_6",
    title: "Apex Logistics",
    url: "https://apexlogistics.codeflies-showcase.io",
    description: "Apex Logistics: Real-time dynamic routing and Mapbox telemetry. Live: https://apexlogistics.codeflies-showcase.io",
    techStack: ["Mapbox GL", "Node.js"],
    tags: ["#Logistics"],
    order: 6,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "proj_7",
    title: "FinScale AI",
    url: "https://finscale.codeflies-showcase.io",
    description: "FinScale AI: Autonomous compliance engine for algorithmic trading desks. Live: https://finscale.codeflies-showcase.io",
    techStack: ["FastAPI", "Python", "OpenAI"],
    tags: ["#Fintech", "#AI"],
    order: 7,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "proj_8",
    title: "PulseFit Mobile",
    url: "https://pulsefit.codeflies-showcase.io",
    description: "PulseFit Mobile: Cross-platform companion for connected gym hardware with offline sync. Live: https://pulsefit.codeflies-showcase.io",
    techStack: ["Flutter", "Firebase"],
    tags: ["#Mobile", "#Fitness"],
    order: 8,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const INITIAL_USERS: User[] = [
  {
    id: "user_admin",
    name: "Codeflies Admin",
    email: "admin@codeflies.com",
    role: "ADMIN",
    status: "ACTIVE",
    image: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: "user_member",
    name: "Sales Engineer",
    email: "member@codeflies.com",
    role: "USER",
    status: "ACTIVE",
    image: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: "user_revoked",
    name: "Revoked User (Demo)",
    email: "revoked@codeflies.com",
    role: "USER",
    status: "REVOKED",
    image: null,
    createdAt: new Date().toISOString(),
  },
];

// Fallback in-memory store
const globalData = globalThis as unknown as {
  inMemoryProjects?: Project[];
  inMemoryUsers?: User[];
  isDatabaseAvailable?: boolean;
};

if (!globalData.inMemoryProjects) {
  globalData.inMemoryProjects = [...INITIAL_PROJECTS];
}
if (!globalData.inMemoryUsers) {
  globalData.inMemoryUsers = [...INITIAL_USERS];
}

async function testDatabaseConnection(): Promise<boolean> {
  if (process.env.DATABASE_URL?.includes("randompassword")) {
    return false;
  }
  try {
    // Quick probe
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

export async function getProjects(): Promise<Project[]> {
  const dbConnected = await testDatabaseConnection();
  if (dbConnected) {
    try {
      const dbProjects = await prisma.project.findMany({
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      });
      if (dbProjects.length > 0) {
        return dbProjects.map((p) => ({
          id: p.id,
          title: p.title,
          url: p.url,
          description: p.description || "",
          techStack: p.techStack,
          tags: p.tags,
          order: p.order,
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString(),
        }));
      } else {
        // Seed default projects into DB
        for (const proj of INITIAL_PROJECTS) {
          await prisma.project.create({
            data: {
              id: proj.id,
              title: proj.title,
              url: proj.url,
              description: proj.description,
              techStack: proj.techStack,
              tags: proj.tags,
              order: proj.order,
            },
          });
        }
        return INITIAL_PROJECTS;
      }
    } catch (err) {
      console.warn("Prisma query failed, falling back to memory store:", err);
    }
  }
  return globalData.inMemoryProjects || INITIAL_PROJECTS;
}

export async function createProject(data: {
  title: string;
  url: string;
  description?: string;
  techStack: string[];
  tags: string[];
}): Promise<Project> {
  const dbConnected = await testDatabaseConnection();
  const newOrder = (globalData.inMemoryProjects?.length || 0) + 1;
  const newProj: Project = {
    id: `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    title: data.title.trim(),
    url: data.url.trim(),
    description: data.description?.trim() || `${data.title}: ${data.url}`,
    techStack: data.techStack,
    tags: data.tags,
    order: newOrder,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (dbConnected) {
    try {
      const created = await prisma.project.create({
        data: {
          title: newProj.title,
          url: newProj.url,
          description: newProj.description,
          techStack: newProj.techStack,
          tags: newProj.tags,
          order: newOrder,
        },
      });
      newProj.id = created.id;
    } catch (err) {
      console.warn("Prisma project create failed, using memory:", err);
    }
  }

  globalData.inMemoryProjects = [newProj, ...(globalData.inMemoryProjects || [])];
  return newProj;
}

export async function updateProject(
  id: string,
  data: Partial<Omit<Project, "id" | "createdAt" | "updatedAt">>
): Promise<Project | null> {
  const dbConnected = await testDatabaseConnection();
  if (dbConnected) {
    try {
      const updated = await prisma.project.update({
        where: { id },
        data: {
          ...(data.title && { title: data.title.trim() }),
          ...(data.url && { url: data.url.trim() }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.techStack && { techStack: data.techStack }),
          ...(data.tags && { tags: data.tags }),
          ...(data.order !== undefined && { order: data.order }),
        },
      });
      return {
        id: updated.id,
        title: updated.title,
        url: updated.url,
        description: updated.description || "",
        techStack: updated.techStack,
        tags: updated.tags,
        order: updated.order,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      };
    } catch (err) {
      console.warn("Prisma update failed, updating in memory:", err);
    }
  }

  const idx = globalData.inMemoryProjects?.findIndex((p) => p.id === id);
  if (idx !== undefined && idx >= 0 && globalData.inMemoryProjects) {
    const existing = globalData.inMemoryProjects[idx];
    const updated: Project = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    globalData.inMemoryProjects[idx] = updated;
    return updated;
  }
  return null;
}

export async function deleteProject(id: string): Promise<boolean> {
  const dbConnected = await testDatabaseConnection();
  if (dbConnected) {
    try {
      await prisma.project.delete({
        where: { id },
      });
    } catch (err) {
      console.warn("Prisma delete failed:", err);
    }
  }

  const initialLen = globalData.inMemoryProjects?.length || 0;
  globalData.inMemoryProjects = globalData.inMemoryProjects?.filter((p) => p.id !== id);
  return (globalData.inMemoryProjects?.length || 0) < initialLen;
}

// User & Access Management
export async function getUsers(): Promise<User[]> {
  const dbConnected = await testDatabaseConnection();
  if (dbConnected) {
    try {
      const dbUsers = await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
      });
      if (dbUsers.length > 0) {
        return dbUsers.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          image: u.image,
          role: u.role as UserRole,
          status: u.status as UserStatus,
          createdAt: u.createdAt.toISOString(),
        }));
      }
    } catch (err) {
      console.warn("Prisma getUsers failed, using memory:", err);
    }
  }
  return globalData.inMemoryUsers || INITIAL_USERS;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const normalized = email.toLowerCase().trim();
  const dbConnected = await testDatabaseConnection();
  if (dbConnected) {
    try {
      const dbUser = await prisma.user.findUnique({
        where: { email: normalized },
      });
      if (dbUser) {
        return {
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          image: dbUser.image,
          role: dbUser.role as UserRole,
          status: dbUser.status as UserStatus,
          createdAt: dbUser.createdAt.toISOString(),
        };
      }
    } catch (err) {
      console.warn("Prisma getUserByEmail failed:", err);
    }
  }

  const found = globalData.inMemoryUsers?.find(
    (u) => u.email.toLowerCase() === normalized
  );
  return found || null;
}

export async function upsertUser(data: {
  email: string;
  name?: string | null;
  image?: string | null;
  role?: UserRole;
  status?: UserStatus;
}): Promise<User> {
  const normalized = data.email.toLowerCase().trim();
  const isAdminEmail =
    normalized === "admin@codeflies.com" ||
    normalized.includes("admin@") ||
    normalized === (process.env.ADMIN_DEFAULT_EMAIL || "").toLowerCase();

  const defaultRole: UserRole = isAdminEmail ? "ADMIN" : (data.role || "USER");
  // If admin email, always active; others default to ACTIVE or PENDING
  const defaultStatus: UserStatus = isAdminEmail ? "ACTIVE" : (data.status || "ACTIVE");

  const dbConnected = await testDatabaseConnection();
  if (dbConnected) {
    try {
      const user = await prisma.user.upsert({
        where: { email: normalized },
        update: {
          name: data.name,
          image: data.image,
        },
        create: {
          email: normalized,
          name: data.name,
          image: data.image,
          role: defaultRole,
          status: defaultStatus,
        },
      });
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role as UserRole,
        status: user.status as UserStatus,
        createdAt: user.createdAt.toISOString(),
      };
    } catch (err) {
      console.warn("Prisma upsertUser failed:", err);
    }
  }

  const existing = globalData.inMemoryUsers?.find(
    (u) => u.email.toLowerCase() === normalized
  );

  if (existing) {
    if (data.name) existing.name = data.name;
    if (data.image) existing.image = data.image;
    return existing;
  }

  const newUser: User = {
    id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    email: normalized,
    name: data.name || normalized.split("@")[0],
    image: data.image || null,
    role: defaultRole,
    status: defaultStatus,
    createdAt: new Date().toISOString(),
  };

  globalData.inMemoryUsers = [newUser, ...(globalData.inMemoryUsers || [])];
  return newUser;
}

export async function updateUserAccess(
  id: string,
  updates: { role?: UserRole; status?: UserStatus }
): Promise<User | null> {
  const dbConnected = await testDatabaseConnection();
  if (dbConnected) {
    try {
      const updated = await prisma.user.update({
        where: { id },
        data: {
          ...(updates.role && { role: updates.role }),
          ...(updates.status && { status: updates.status }),
        },
      });
      return {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        image: updated.image,
        role: updated.role as UserRole,
        status: updated.status as UserStatus,
        createdAt: updated.createdAt.toISOString(),
      };
    } catch (err) {
      console.warn("Prisma updateUserAccess failed:", err);
    }
  }

  const idx = globalData.inMemoryUsers?.findIndex((u) => u.id === id);
  if (idx !== undefined && idx >= 0 && globalData.inMemoryUsers) {
    const existing = globalData.inMemoryUsers[idx];
    const updated: User = {
      ...existing,
      ...updates,
    };
    globalData.inMemoryUsers[idx] = updated;
    return updated;
  }
  return null;
}
