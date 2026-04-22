
export interface Profile {
  name: string;
  position: string;
  university: string;
  bio: string;
  image: string;
  email: string;
  github: string;
  linkedin: string;
  scholar?: string;
  orcid?: string;
  facebook?: string;
}

export interface ResearchInterest {
  title: string;
  icon: string;
  description: string;
}

export interface Experience {
  role: string;
  organization: string;
  period: string;
  description: string;
  type: 'leadership' | 'academic';
}

export interface Project {
  title: string;
  description: string;
  detailedDescription?: string;
  features?: string[];
  image: string;
  tags: string[];
  link?: string;
  github?: string;
}

export interface SkillCategory {
  category: string;
  items: string[];
}

export interface Achievement {
  title: string;
  date: string;
  issuer: string;
}

export interface Interest {
  title: string;
  icon: string;
  description: string;
}

export interface PortfolioData {
  profile: Profile;
  research: ResearchInterest[];
  experience: Experience[];
  projects: Project[];
  skills: SkillCategory[];
  achievements: Achievement[];
  interests: Interest[];
}
