
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from "motion/react";
import { 
  Profile, 
  ResearchInterest, 
  Experience, 
  Project, 
  SkillCategory, 
  Achievement, 
  PortfolioData 
} from './types';

// Fallback data
const FALLBACK_DATA: PortfolioData = {
  profile: {
    name: "Md Atik Sheikh",
    position: "Chair person, IEEE PES RUSBC",
    university: "University of Rajshahi",
    bio: "Graduate Electrical and Electronic Engineer specializing in Plasma Technology and environmental sustainability. Research focused on wastewater treatment and agricultural sterilization, with leadership in the IEEE Power & Energy Society.",
    image: "/atik.jpg",
    email: "atikrueee@gmail.com",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    scholar: "https://scholar.google.com",
    orcid: "https://orcid.org",
    facebook: "https://facebook.com"
  },
  research: [
    { title: "Plasma Technology", icon: "fa-atom", description: "Cold Plasma Physics and Sterilization Systems." }
  ],
  experience: [
    { role: "Chair person", organization: "IEEE PES RUSBC", period: "2024 - Present", description: "Strategic leadership and branch management.", type: "leadership" }
  ],
  projects: [
    { title: "Plasma-Ionics System", description: "Innovative plasma plumes for treatment.", image: "https://picsum.photos/seed/plasma/800/450", tags: ["EEE", "Research"] }
  ],
  skills: [
    { category: "Engineering", items: ["Plasma Physics", "Circuit Design"] }
  ],
  achievements: [
    { title: "Best Student Volunteer", date: "2023", issuer: "IEEE Bangladesh Section" }
  ],
  interests: [
    { title: "Photography", icon: "fa-camera", description: "Advanced manual calibration." }
  ]
};

// --- Components ---

const RevealOnScroll: React.FC<{ children: React.ReactNode; className?: string; delay?: number }> = ({ children, className = "", delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: "easeOut", delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const SectionTitle: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8, ease: "easeOut" }}
    className="mb-12 text-center"
  >
    <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">{title}</h2>
    {subtitle && <p className="text-brand font-semibold tracking-wider uppercase text-sm">{subtitle}</p>}
    <motion.div 
      initial={{ width: 0 }}
      whileInView={{ width: 80 }}
      viewport={{ once: true }}
      transition={{ duration: 1, delay: 0.5 }}
      className="h-1.5 bg-brand mx-auto mt-4 rounded-full"
    ></motion.div>
  </motion.div>
);

const SocialLinks: React.FC<{ profile: Profile; className?: string; iconSize?: string }> = ({ profile, className = "", iconSize = "text-2xl" }) => {
  const links = [
    { icon: "fab fa-github", url: profile.github, label: "GitHub" },
    { icon: "fab fa-linkedin", url: profile.linkedin, label: "LinkedIn" },
    { icon: "fas fa-graduation-cap", url: profile.scholar, label: "Google Scholar" },
    { icon: "fab fa-orcid", url: profile.orcid, label: "ORCID" },
    { icon: "fab fa-facebook", url: profile.facebook, label: "Facebook" }
  ].filter(link => link.url);

  return (
    <motion.div 
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.1 }
        }
      }}
      className={`flex flex-wrap items-center gap-4 ${className}`}
    >
      {links.map((link, i) => (
        <motion.a
          key={i}
          href={link.url}
          target="_blank"
          rel="noreferrer"
          variants={{
            hidden: { opacity: 0, scale: 0.8 },
            visible: { opacity: 1, scale: 1 }
          }}
          whileHover={{ scale: 1.2, y: -5 }}
          className={`w-12 h-12 glass rounded-2xl flex items-center justify-center ${iconSize} hover:bg-brand hover:text-white transition-all shadow-xl`}
          title={link.label}
        >
          <i className={link.icon}></i>
        </motion.a>
      ))}
    </motion.div>
  );
};

const AIChatBot: React.FC<{ data: PortfolioData }> = ({ data }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot', text: string }[]>([
    { role: 'bot', text: `Hi! I'm Atik's AI assistant. Ask me anything about his work in Robotics or IEEE!` }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const systemPrompt = `You are a professional AI Assistant for Md Atik Sheikh.
      Use this context to answer questions:
      - Bio: ${data.profile.bio}
      - Position: ${data.profile.position} at ${data.profile.university}
      - Skills: ${data.skills.map(s => s.category + ": " + s.items.join(", ")).join("; ")}
      - Projects: ${data.projects.map(p => p.title).join(", ")}
      - Research: ${data.research.map(r => r.title).join(", ")}
      
      Instructions:
      1. Keep it short and polite.
      2. Format with markdown bolding.
      3. For contact, provide ${data.profile.email}.
      4. If unsure, say "I don't have that specific data, but you can contact Md Atik Sheikh directly."`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMsg,
        config: { systemInstruction: systemPrompt }
      });

      setMessages(prev => [...prev, { role: 'bot', text: response.text || "I couldn't generate a reply." }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: "Service temporary unavailable. Please try again later." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] font-sans">
      {!isOpen ? (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-brand text-white rounded-full shadow-2xl flex items-center justify-center text-2xl hover:scale-110 transition-transform animate-bounce border-4 border-white dark:border-slate-800"
        >
          <i className="fas fa-comment-dots"></i>
        </button>
      ) : (
        <div className="w-[90vw] md:w-96 h-[500px] glass rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-brand/20">
          <div className="bg-brand p-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center"><i className="fas fa-robot"></i></div>
              <span className="font-bold text-sm">Assistant</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:rotate-90 transition-transform"><i className="fas fa-times"></i></button>
          </div>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-900/50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${
                  m.role === 'user' 
                  ? 'bg-brand text-white rounded-tr-none' 
                  : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200 dark:border-slate-700'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && <div className="text-[10px] text-slate-400 animate-pulse">Typing...</div>}
          </div>
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="flex gap-2">
              <input 
                type="text" value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask me anything..."
                className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-brand dark:text-white"
              />
              <button onClick={handleSend} className="bg-brand text-white w-10 h-10 rounded-xl flex items-center justify-center hover:bg-brand-dark transition-colors">
                <i className="fas fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ProjectModal: React.FC<{ project: Project; onClose: () => void }> = ({ project, onClose }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[200] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-5xl glass rounded-[3rem] overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 w-12 h-12 glass rounded-full flex items-center justify-center text-xl hover:rotate-90 transition-transform z-50 overflow-hidden"
        >
          <i className="fas fa-times"></i>
        </button>

        <div className="overflow-y-auto flex-1">
          <div className="relative h-[300px] md:h-[450px]">
            <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
            <div className="absolute bottom-8 left-8 right-8">
              <div className="flex gap-3 mb-4 flex-wrap">
                {project.tags.map(tag => (
                  <span key={tag} className="px-4 py-1.5 bg-brand text-white text-[10px] font-black rounded-xl uppercase tracking-widest">{tag}</span>
                ))}
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-white leading-tight">{project.title}</h2>
            </div>
          </div>

          <div className="p-8 md:p-12 space-y-12">
            <div className="grid md:grid-cols-3 gap-12">
              <div className="md:col-span-2 space-y-6">
                <h3 className="text-2xl font-black flex items-center gap-3">
                  <i className="fas fa-info-circle text-brand"></i> Project Overview
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed font-medium">
                  {project.detailedDescription || project.description}
                </p>
              </div>
              <div className="space-y-6">
                <h3 className="text-2xl font-black flex items-center gap-3">
                  <i className="fas fa-star text-brand"></i> Key Features
                </h3>
                <ul className="space-y-4">
                  {(project.features || []).map((feature, i) => (
                    <li key={i} className="flex gap-3 items-start text-slate-600 dark:text-slate-400 font-bold">
                      <div className="w-6 h-6 rounded-lg bg-brand/10 flex items-center justify-center text-brand text-xs mt-1 shrink-0">
                        <i className="fas fa-check"></i>
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex flex-wrap gap-6 pt-12 border-t border-slate-200 dark:border-slate-800">
              {project.github && (
                <a href={project.github} target="_blank" rel="noreferrer" className="flex-1 md:flex-none px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-2xl font-black text-center flex items-center justify-center gap-3 hover:-translate-y-1 transition-all">
                  <i className="fab fa-github text-xl"></i> View Code
                </a>
              )}
              {project.link && (
                <a href={project.link} target="_blank" rel="noreferrer" className="flex-1 md:flex-none px-8 py-4 bg-brand text-white rounded-2xl font-black text-center flex items-center justify-center gap-3 shadow-xl shadow-brand/20 hover:-translate-y-1 transition-all">
                  <i className="fas fa-external-link-alt text-xl"></i> Live Demo
                </a>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// --- Main App ---

const App: React.FC = () => {
  const [data, setData] = useState<PortfolioData>(FALLBACK_DATA);
  const [darkMode, setDarkMode] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchFile = async (path: string) => {
          const res = await fetch(path);
          if (!res.ok) throw new Error(`404: ${path}`);
          return res.json();
        };
        const [profile, research, experience, projects, skills, achievements, interests] = await Promise.all([
          fetchFile('/content/profile.json'),
          fetchFile('/content/research.json'),
          fetchFile('/content/experience.json'),
          fetchFile('/content/projects.json'),
          fetchFile('/content/skills.json'),
          fetchFile('/content/achievements.json'),
          fetchFile('/content/interests.json').catch(() => []),
        ]);
        setData({ 
          profile, 
          research: Array.isArray(research) ? research : (research.areas || []), 
          experience: Array.isArray(experience) ? experience : (experience.experiences || []), 
          projects: Array.isArray(projects) ? projects : (projects.projects || []), 
          skills: Array.isArray(skills) ? skills : (skills.categories || []), 
          achievements: Array.isArray(achievements) ? achievements : (achievements.awards || []),
          interests: Array.isArray(interests) ? interests : []
        });
      } catch (err) {
        setData(FALLBACK_DATA);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Research', href: '#research' },
    { name: 'Skills', href: '#skills' },
    { name: 'Experience', href: '#experience' },
    { name: 'Projects', href: '#projects' },
    { name: 'Interests', href: '#interests' },
    { name: 'Contact', href: '#contact' }
  ];

  if (loading) return (
    <div className="h-screen w-screen flex items-center justify-center bg-slate-950">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand border-t-transparent"></div>
    </div>
  );

  return (
    <div id="home" className="min-h-screen selection:bg-brand/30 transition-colors duration-300">
      <AnimatePresence>
        {selectedProject && <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />}
      </AnimatePresence>
      <AIChatBot data={data} />
      
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] bg-brand/10 dark:bg-brand/5 blur-[120px] rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-[-5%] right-[-5%] w-[50%] h-[50%] bg-brand/10 dark:bg-brand/5 blur-[120px] rounded-full animate-pulse-slow"></div>
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 px-4 md:px-8 py-4">
        <div className="max-w-7xl mx-auto glass rounded-2xl px-6 py-3 flex items-center justify-between shadow-xl">
          <a href="#home" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-brand/20">A</div>
            <span className="font-extrabold text-xl tracking-tighter hidden sm:block">Atik Sheikh</span>
          </a>
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(item => (
              <a key={item.name} href={item.href} className="text-sm font-semibold hover:text-brand transition-colors text-slate-600 dark:text-slate-300">{item.name}</a>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-xl glass hover:bg-slate-200 dark:hover:bg-slate-800 transition-all">
              {darkMode ? <i className="fas fa-sun"></i> : <i className="fas fa-moon"></i>}
            </button>
            <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
            </button>
          </div>
        </div>
        {isMenuOpen && (
          <div className="md:hidden absolute top-20 left-4 right-4 glass rounded-2xl p-6 shadow-2xl flex flex-col gap-4">
            {navLinks.map(item => (
              <a key={item.name} href={item.href} onClick={() => setIsMenuOpen(false)} className="text-lg font-bold p-2 border-b border-slate-200 dark:border-slate-800">{item.name}</a>
            ))}
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="about" className="pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <RevealOnScroll className="order-2 md:order-1 text-center md:text-left">
            <span className="inline-block px-4 py-1.5 rounded-full bg-brand/10 text-brand text-xs font-black mb-6 uppercase tracking-widest border border-brand/20">Researcher & Leader</span>
            <h1 className="text-5xl md:text-8xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-brand to-brand-dark dark:from-white dark:to-brand-light leading-[1.1]">{data.profile.name}</h1>
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 mb-8 font-semibold leading-relaxed">
              {data.profile.position} <br />
              <span className="text-brand/80 text-lg uppercase tracking-wider">{data.profile.university}</span>
            </p>
            <p className="text-lg text-slate-500 dark:text-slate-400 mb-10 max-w-xl leading-relaxed font-medium">{data.profile.bio}</p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start mb-8">
              <a href="#contact" className="px-10 py-4 bg-brand hover:bg-brand-dark text-white rounded-2xl font-black transition-all shadow-2xl shadow-brand/30 hover:-translate-y-1">Hire Me</a>
              <a href="#projects" className="px-10 py-4 glass hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl font-black transition-all hover:-translate-y-1">Projects</a>
            </div>
            <SocialLinks profile={data.profile} className="justify-center md:justify-start" />
          </RevealOnScroll>
          <div className="order-1 md:order-2 flex justify-center">
            <RevealOnScroll className="relative">
              <div className="absolute inset-0 bg-brand/20 blur-[100px] rounded-full animate-pulse"></div>
              <img src={data.profile.image} alt={data.profile.name} className="w-64 h-64 md:w-96 md:h-96 rounded-[4rem] object-cover border-8 border-white dark:border-slate-800 shadow-2xl animate-float relative z-10" />
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* Research Section */}
      <section id="research" className="py-24 px-6 bg-slate-100/50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <SectionTitle title="Core Research" subtitle="Focus Areas" />
          <div className="grid md:grid-cols-3 gap-8">
            {data.research.map((item, idx) => (
              <RevealOnScroll key={idx} className="h-full" delay={idx * 0.1}>
                <div className="glass p-10 rounded-[3rem] h-full hover:bg-white dark:hover:bg-slate-800 transition-all flex flex-col items-center text-center group border border-transparent hover:border-brand/20 shadow-lg">
                  <div className="w-20 h-20 bg-brand/10 group-hover:bg-brand group-hover:text-white transition-all rounded-[2rem] flex items-center justify-center text-brand text-4xl mb-8"><i className={`fas ${item.icon}`}></i></div>
                  <h3 className="text-2xl font-black mb-4">{item.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{item.description}</p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <SectionTitle title="Expertise" subtitle="Technical Skills" />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {data.skills.map((item, idx) => (
              <RevealOnScroll key={idx} className="h-full" delay={idx * 0.1}>
                <div className="glass p-8 rounded-[2.5rem] h-full border border-slate-200/50 dark:border-slate-800/50 hover:border-brand/20 transition-all">
                  <h3 className="text-xl font-black mb-6 text-brand">{item.category}</h3>
                  <div className="flex flex-wrap gap-2">
                    {item.items.map(skill => (
                      <span key={skill} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section id="experience" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <SectionTitle title="Timeline" subtitle="Experience" />
          <div className="space-y-10">
            {data.experience.map((exp, idx) => (
              <RevealOnScroll key={idx}>
                <div className="glass p-10 rounded-[2.5rem] relative overflow-hidden group hover:shadow-2xl transition-all border border-slate-200/50 dark:border-slate-800/50">
                  <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <i className={`fas ${exp.type === 'leadership' ? 'fa-users' : 'fa-graduation-cap'} text-[12rem]`}></i>
                  </div>
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                    <div>
                      <h3 className="text-3xl font-black text-slate-900 dark:text-white group-hover:text-brand transition-colors">{exp.role}</h3>
                      <p className="text-brand text-xl font-bold mt-1">{exp.organization}</p>
                    </div>
                    <span className="px-6 py-2 rounded-2xl bg-slate-200/50 dark:bg-slate-800 text-sm font-black text-slate-600 dark:text-slate-400 whitespace-nowrap">{exp.period}</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 font-medium text-lg leading-relaxed relative z-10">{exp.description}</p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      <section id="projects" className="py-24 px-6 bg-slate-100/50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <SectionTitle title="Technical Portfolio" subtitle="Featured Projects" />
          <div className="grid md:grid-cols-2 gap-12">
            {data.projects.map((proj, idx) => (
              <RevealOnScroll key={idx} delay={idx * 0.1}>
                <div 
                  onClick={() => setSelectedProject(proj)}
                  className="glass overflow-hidden rounded-[3.5rem] group hover:shadow-2xl transition-all duration-500 bg-white/20 dark:bg-slate-800/20 cursor-pointer"
                >
                  <div className="relative h-80 overflow-hidden">
                    <img src={proj.image} alt={proj.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent"></div>
                    <div className="absolute bottom-8 left-8 flex gap-3 flex-wrap">
                      {proj.tags.map(tag => (<span key={tag} className="px-4 py-1.5 bg-brand text-white text-[10px] font-black rounded-xl uppercase tracking-widest">{tag}</span>))}
                    </div>
                  </div>
                  <div className="p-10">
                    <h3 className="text-3xl font-black mb-4">{proj.title}</h3>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mb-8 leading-relaxed line-clamp-2 text-lg">{proj.description}</p>
                    <div className="flex items-center gap-6">
                      {proj.github && <button onClick={(e) => { e.stopPropagation(); window.open(proj.github, '_blank'); }} className="flex items-center gap-2 text-sm font-black hover:text-brand transition-all text-slate-600 dark:text-slate-400"><i className="fab fa-github text-xl"></i> Code</button>}
                      {proj.link && <button onClick={(e) => { e.stopPropagation(); window.open(proj.link, '_blank'); }} className="flex items-center gap-2 text-sm font-black hover:text-brand transition-all text-slate-600 dark:text-slate-400"><i className="fas fa-external-link-alt text-xl"></i> Live</button>}
                      <button 
                        onClick={() => setSelectedProject(proj)}
                        className="ml-auto px-6 py-3 bg-brand/10 hover:bg-brand text-brand hover:text-white rounded-xl text-xs font-black transition-all flex items-center gap-2 group/btn"
                      >
                        View Details 
                        <i className="fas fa-arrow-right group-hover/btn:translate-x-1 transition-transform"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Interests Section */}
      <section id="interests" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <SectionTitle title="Beyond the Lab" subtitle="Personal Interests" />
          <div className="grid md:grid-cols-3 gap-8">
            {data.interests.map((item, idx) => (
              <RevealOnScroll key={idx} className="h-full" delay={idx * 0.1}>
                <div className="glass p-10 rounded-[3rem] h-full hover:bg-white dark:hover:bg-slate-800 transition-all flex flex-col items-center text-center group border border-transparent hover:border-brand/20 shadow-lg">
                  <div className="w-20 h-20 bg-brand/10 group-hover:bg-brand group-hover:text-white transition-all rounded-[2rem] flex items-center justify-center text-brand text-4xl mb-8"><i className={`fas ${item.icon}`}></i></div>
                  <h3 className="text-2xl font-black mb-4">{item.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{item.description}</p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>
      <section id="contact" className="py-32 px-6 bg-brand dark:bg-brand-dark relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <RevealOnScroll>
            <h2 className="text-5xl md:text-7xl font-black text-white mb-10 leading-tight">Ready to collaborate?</h2>
            <div className="glass bg-white/10 p-12 rounded-[4rem] border-white/20 shadow-3xl">
              <motion.a 
                whileHover={{ scale: 1.02 }}
                href={`mailto:${data.profile.email}`} 
                className="text-white text-3xl md:text-4xl font-black mb-12 block hover:scale-105 transition-transform break-all tracking-tight"
              >
                {data.profile.email}
              </motion.a>
              <SocialLinks profile={data.profile} className="justify-center" iconSize="text-4xl" />
            </div>
          </RevealOnScroll>
        </div>
      </section>

      <footer className="py-16 text-center border-t border-slate-200 dark:border-slate-800">
        <div className="flex justify-center gap-10 mb-8 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
           <a href="#home" className="hover:text-brand transition-all">Home</a>
           <a href="#about" className="hover:text-brand transition-all">About</a>
           <a href="#projects" className="hover:text-brand transition-all">Projects</a>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
          &copy; {new Date().getFullYear()} Md Atik Sheikh.
        </p>
      </footer>
    </div>
  );
};

export default App;
