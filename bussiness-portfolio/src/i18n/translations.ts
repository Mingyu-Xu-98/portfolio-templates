export const translations = {
  zh: {
    nav: {
      projects: "项目",
      timeline: "经历",
      skills: "技能",
      education: "教育",
      contact: "联系",
    },
    hero: {
      lines: [
        "> Hello World",
        "> 我是徐铭钰",
        "> 业务分析师 & AI 应用工程师",
        "> 聚焦大模型应用落地与数据驱动洞察",
        "> 上海 · xumingyu2021@163.com",
      ],
      tags: [
        "AI 应用落地",
        "提示工程",
        "数据分析",
        "产品设计",
        "知识库建设",
        "DSL 设计",
      ],
    },
    sections: {
      projects: "核心项目",
      timeline: "经历",
      skills: "技能",
      education: "教育",
      contact: "联系我",
    },
    projects: [
      {
        title: "银行知识库建设项目",
        org: "文因互联 · 2024",
        badge: "在职",
        desc: "负责某大型商业银行知识库建设，收集分析 10+ 业务功能需求，需求全部成功上线。设计知识库产品功能框架，与客户合作组织大模型落地场景调研。",
        tags: ["需求分析", "产品设计", "大模型落地"],
        image: "/images/project-bank-kb.png",
      },
      {
        title: "大模型应用落地",
        org: "文因互联 · 2024",
        badge: "在职",
        desc: "负责大模型应用系统总体架构和功能设计。通过提示工程优化，实现大模型准确输出 3000 字分析报告。涵盖智能问答、智能撰写等场景。",
        tags: ["提示工程", "DSL设计", "架构设计", "流程编排"],
        image: "/images/project-llm.png",
      },
      {
        title: "谈判道场 Deal Dojo",
        org: "个人项目 · 开源",
        link: "https://github.com/Mingyu-Xu-98/negotiator",
        desc: "基于哈佛经典谈判术的 AI 谈判练习平台，支持 7 大谈判技能模块、困难模式场景训练，帮助用户在实战中提升谈判能力。",
        tags: ["FastAPI", "Tailwind CSS", "OpenRouter", "Jinja2"],
        image: "/images/project-deal-dojo.png",
      },
      {
        title: "Eco Explorer 生态探险",
        org: "个人项目 · 开源",
        link: "https://github.com/Mingyu-Xu-98/eco-explorer",
        desc: "中国极致环境虚拟探险平台，涵盖 7 大极端环境的物种收集、谜题挑战和知识问答系统，将学习过程游戏化。",
        tags: ["交互地图", "物种收集", "知识问答", "游戏化学习"],
        image: "/images/project-eco-explorer.png",
      },
    ],
    timeline: [
      {
        date: "2024 - 至今",
        title: "AI 独立开发",
        desc: "Agent 应用开发、个人开源项目",
        active: true,
      },
      {
        date: "2024",
        title: "文因互联 · 助理业务经理",
        desc: "银行知识库建设、大模型应用落地、产品架构设计",
      },
      {
        date: "2023",
        title: "好买财富 & 西部证券",
        desc: "产品经理 & 数据分析，量化投资数据分析",
      },
      {
        date: "2021 - 2024",
        title: "上海工程技术大学",
        desc: "工商管理硕士 · 国家奖学金 · SCI/EI论文",
      },
      {
        date: "2016 - 2020",
        title: "安徽财经大学",
        desc: "财务管理学士",
      },
    ],
    skills: [
      {
        title: "AI & 大模型",
        skills: ["提示工程", "DSL 设计", "大模型评测", "RAG / 知识库", "Dify", "GPT-4"],
      },
      {
        title: "数据分析",
        skills: ["Python", "SQL", "数据可视化", "回归分析", "机器学习建模", "指标体系构建"],
      },
      {
        title: "金融平台",
        skills: ["Wind", "Choice", "Bloomberg", "行业分析", "竞品分析"],
      },
      {
        title: "产品设计",
        skills: ["PRD 撰写", "原型设计", "需求分析", "用户画像", "小程序开发"],
      },
      {
        title: "开发技术",
        skills: ["FastAPI", "Tailwind CSS", "JavaScript", "Jinja2"],
      },
      {
        title: "项目管理",
        skills: ["SOP 撰写", "需求拉通", "跨部门沟通", "项目交付"],
      },
    ],
    education: [
      {
        school: "上海工程技术大学",
        degree: "工商管理硕士 · 2021 - 2024",
        highlights: [
          "国家奖学金（Top 5%）+ 学业一等奖学金",
          "EI 会议论文 2 篇、CSCD 论文 1 篇、SCI 论文 1 篇",
          "「优秀班级团支书」称号",
        ],
      },
      {
        school: "安徽财经大学",
        degree: "财务管理学士 · 2016 - 2020",
        highlights: ["管理学、金融学、投资学、财务管理、会计学、高等数学、概率论"],
      },
    ],
    footer: "© 2026 徐铭钰. All rights reserved.",
    chatbot: {
      title: "徐铭钰的 AI 分身",
      subtitle: "随时了解我的经历和技能",
      welcome: "你好！我是铭钰的 AI 分身，可以回答关于我的经历、技能和项目的问题。",
      placeholder: "输入你的问题...",
      send: "发送",
      tooltip: "和我的 AI 分身聊聊",
      suggestions: [
        "你是做什么工作的？",
        "介绍一下你的项目经历",
        "你有哪些技能？",
        "你的教育背景是什么？",
      ],
    },
    themeToggle: {
      light: "切换浅色模式",
      dark: "切换深色模式",
    },
  },
  en: {
    nav: {
      projects: "Projects",
      timeline: "Timeline",
      skills: "Skills",
      education: "Education",
      contact: "Contact",
    },
    hero: {
      lines: [
        "> Hello World",
        "> I'm Xu Mingyu",
        "> Business Analyst & AI Engineer",
        "> LLM Applications & Data-Driven Insights",
        "> Shanghai · xumingyu2021@163.com",
      ],
      tags: [
        "AI Apps",
        "Prompt Eng.",
        "Data Analysis",
        "Product Design",
        "Knowledge Base",
        "DSL Design",
      ],
    },
    sections: {
      projects: "Projects",
      timeline: "Timeline",
      skills: "Skills",
      education: "Education",
      contact: "Contact",
    },
    projects: [
      {
        title: "Bank Knowledge Base",
        org: "Wenyin · 2024",
        badge: "Current",
        desc: "Led knowledge base construction for a major commercial bank. Analyzed 10+ business requirements, all successfully launched. Designed product framework and organized LLM scenario research.",
        tags: ["Requirements", "Product Design", "LLM"],
        image: "/images/project-bank-kb.png",
      },
      {
        title: "LLM Application Platform",
        org: "Wenyin · 2024",
        badge: "Current",
        desc: "Led system architecture and feature design for LLM applications. Optimized prompts to generate accurate 3000-word analysis reports. Covering Q&A, writing, and more.",
        tags: ["Prompt Eng.", "DSL", "Architecture", "Orchestration"],
        image: "/images/project-llm.png",
      },
      {
        title: "Deal Dojo",
        org: "Personal · Open Source",
        link: "https://github.com/Mingyu-Xu-98/negotiator",
        desc: "AI negotiation training platform based on Harvard negotiation theory. 7 skill modules with difficulty modes for real-world practice.",
        tags: ["FastAPI", "Tailwind CSS", "OpenRouter", "Jinja2"],
        image: "/images/project-deal-dojo.png",
      },
      {
        title: "Eco Explorer",
        org: "Personal · Open Source",
        link: "https://github.com/Mingyu-Xu-98/eco-explorer",
        desc: "Virtual ecology exploration platform covering 7 extreme environments in China. Species collection, puzzles, and gamified learning.",
        tags: ["Interactive Map", "Collection", "Quiz", "Gamification"],
        image: "/images/project-eco-explorer.png",
      },
    ],
    timeline: [
      {
        date: "2024 - Present",
        title: "Independent AI Developer",
        desc: "Agent applications & open source projects",
        active: true,
      },
      {
        date: "2024",
        title: "Wenyin · Asst. Business Manager",
        desc: "Bank KB, LLM apps, product architecture",
      },
      {
        date: "2023",
        title: "Howbuy & Western Securities",
        desc: "Product Manager & Data Analyst",
      },
      {
        date: "2021 - 2024",
        title: "Shanghai Univ. of Eng. Science",
        desc: "MBA · National Scholarship · SCI/EI Papers",
      },
      {
        date: "2016 - 2020",
        title: "Anhui Univ. of Finance & Econ.",
        desc: "B.S. Financial Management",
      },
    ],
    skills: [
      {
        title: "AI & LLM",
        skills: ["Prompt Eng.", "DSL Design", "LLM Eval", "RAG / KB", "Dify", "GPT-4"],
      },
      {
        title: "Data Analysis",
        skills: ["Python", "SQL", "Visualization", "Regression", "ML Modeling", "KPI Systems"],
      },
      {
        title: "Finance Tools",
        skills: ["Wind", "Choice", "Bloomberg", "Industry Analysis", "Competitive Analysis"],
      },
      {
        title: "Product Design",
        skills: ["PRD Writing", "Prototyping", "Requirements", "User Persona", "Mini Apps"],
      },
      {
        title: "Development",
        skills: ["FastAPI", "Tailwind CSS", "JavaScript", "Jinja2"],
      },
      {
        title: "Project Mgmt",
        skills: ["SOP Writing", "Alignment", "Cross-team", "Delivery"],
      },
    ],
    education: [
      {
        school: "Shanghai Univ. of Eng. Science",
        degree: "MBA · 2021 - 2024",
        highlights: [
          "National Scholarship (Top 5%) + First-Class Scholarship",
          "2 EI Papers, 1 CSCD Paper, 1 SCI Paper",
          "Outstanding Class Leader",
        ],
      },
      {
        school: "Anhui Univ. of Finance & Economics",
        degree: "B.S. Financial Management · 2016 - 2020",
        highlights: [
          "Management, Finance, Investment, Accounting, Statistics",
        ],
      },
    ],
    footer: "© 2026 Xu Mingyu. All rights reserved.",
    chatbot: {
      title: "Mingyu's AI Avatar",
      subtitle: "Ask about my experience & skills",
      welcome:
        "Hi! I'm Mingyu's AI avatar. Ask me about my experience, skills, and projects.",
      placeholder: "Type your question...",
      send: "Send",
      tooltip: "Chat with my AI avatar",
      suggestions: [
        "What do you do?",
        "Tell me about your projects",
        "What are your skills?",
        "What's your education?",
      ],
    },
    themeToggle: {
      light: "Switch to light mode",
      dark: "Switch to dark mode",
    },
  },
} as const;

export type Lang = keyof typeof translations;
export type Translations = (typeof translations)[Lang];
