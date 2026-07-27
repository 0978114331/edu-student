import {
  PenLine,
  Languages,
  SpellCheck,
  FileText,
  ScrollText,
  Image as ImageIcon,
  Palette,
  Presentation,
  Briefcase,
  Code2,
  Braces,
  MessageSquare,
  Search,
  Calculator,
  ListChecks,
  Layers,
  type LucideIcon,
} from 'lucide-react';

export interface ToolMeta {
  name: string;
  slug: string;
  description: string;
  icon: string;
  category: string;
  is_pro: boolean;
  usage_limit_free: number;
}

export const TOOL_CATEGORIES = [
  'Writing',
  'Language',
  'Documents',
  'Creative',
  'Career',
  'Coding',
  'Assistant',
  'Research',
  'Study',
] as const;

export const TOOL_ICONS: Record<string, LucideIcon> = {
  PenLine,
  Languages,
  SpellCheck,
  FileText,
  ScrollText,
  Image: ImageIcon,
  Palette,
  Presentation,
  Briefcase,
  Code2,
  Braces,
  MessageSquare,
  Search,
  Calculator,
  ListChecks,
  Layers,
};

export function getToolIcon(name: string): LucideIcon {
  return TOOL_ICONS[name] ?? MessageSquare;
}

export const TOOL_CATALOG: ToolMeta[] = [
  { name: 'AI Writing', slug: 'ai-writing', description: 'Generate essays, articles, and creative content with AI.', icon: 'PenLine', category: 'Writing', is_pro: false, usage_limit_free: 10 },
  { name: 'AI Translator', slug: 'ai-translator', description: 'Translate text between dozens of languages instantly.', icon: 'Languages', category: 'Language', is_pro: false, usage_limit_free: 15 },
  { name: 'AI Grammar Checker', slug: 'ai-grammar-checker', description: 'Fix grammar, spelling, and style in your writing.', icon: 'SpellCheck', category: 'Writing', is_pro: false, usage_limit_free: 10 },
  { name: 'AI PDF Reader', slug: 'ai-pdf-reader', description: 'Extract and understand content from PDF documents.', icon: 'FileText', category: 'Documents', is_pro: true, usage_limit_free: 3 },
  { name: 'AI Document Summarizer', slug: 'ai-doc-summarizer', description: 'Summarize long documents into key points.', icon: 'ScrollText', category: 'Documents', is_pro: true, usage_limit_free: 3 },
  { name: 'AI Image Generator', slug: 'ai-image-generator', description: 'Create stunning images from text prompts.', icon: 'Image', category: 'Creative', is_pro: true, usage_limit_free: 2 },
  { name: 'AI Logo Generator', slug: 'ai-logo-generator', description: 'Design professional logos in seconds.', icon: 'Palette', category: 'Creative', is_pro: true, usage_limit_free: 2 },
  { name: 'AI Presentation Generator', slug: 'ai-presentation', description: 'Build slide decks from a topic outline.', icon: 'Presentation', category: 'Creative', is_pro: true, usage_limit_free: 2 },
  { name: 'AI Resume Builder', slug: 'ai-resume-builder', description: 'Craft a polished resume with AI guidance.', icon: 'Briefcase', category: 'Career', is_pro: false, usage_limit_free: 5 },
  { name: 'AI Programming Assistant', slug: 'ai-programming', description: 'Get help writing and debugging code.', icon: 'Code2', category: 'Coding', is_pro: false, usage_limit_free: 10 },
  { name: 'AI Coding Helper', slug: 'ai-coding-helper', description: 'Explain snippets and suggest improvements.', icon: 'Braces', category: 'Coding', is_pro: false, usage_limit_free: 10 },
  { name: 'AI Chat Assistant', slug: 'ai-chat', description: 'Conversational AI for any question.', icon: 'MessageSquare', category: 'Assistant', is_pro: false, usage_limit_free: 20 },
  { name: 'AI Research Assistant', slug: 'ai-research', description: 'Find and organize research sources.', icon: 'Search', category: 'Research', is_pro: true, usage_limit_free: 3 },
  { name: 'AI Math Solver', slug: 'ai-math-solver', description: 'Solve equations and explain steps.', icon: 'Calculator', category: 'Study', is_pro: false, usage_limit_free: 10 },
  { name: 'AI Quiz Generator', slug: 'ai-quiz-generator', description: 'Create quizzes from any topic.', icon: 'ListChecks', category: 'Study', is_pro: false, usage_limit_free: 8 },
  { name: 'AI Flashcard Generator', slug: 'ai-flashcards', description: 'Turn notes into study flashcards.', icon: 'Layers', category: 'Study', is_pro: false, usage_limit_free: 8 },
];

export interface ResourceMeta {
  name: string;
  description: string;
  type: string;
  category: string;
  image_url: string;
  is_premium: boolean;
  rating: number;
}

export const RESOURCE_TYPES = [
  'course',
  'ebook',
  'document',
  'video',
  'tutorial',
  'exercise',
] as const;

export const RESOURCE_CATALOG: ResourceMeta[] = [
  { name: 'Introduction to Python', description: 'Learn the fundamentals of Python programming.', type: 'course', category: 'Programming', image_url: 'https://images.pexels.com/photos/1181271/pexels-photo-1181271.jpeg?auto=compress&cs=tinysrgb&w=600', is_premium: false, rating: 4.8 },
  { name: 'Data Science Essentials', description: 'Master the basics of data analysis and visualization.', type: 'course', category: 'Data Science', image_url: 'https://images.pexels.com/photos/5905702/pexels-photo-5905702.jpeg?auto=compress&cs=tinysrgb&w=600', is_premium: true, rating: 4.7 },
  { name: 'Calculus Made Easy', description: 'A clear introduction to differential and integral calculus.', type: 'ebook', category: 'Mathematics', image_url: 'https://images.pexels.com/photos/6386075/pexels-photo-6386075.jpeg?auto=compress&cs=tinysrgb&w=600', is_premium: false, rating: 4.6 },
  { name: 'Web Development Bootcamp', description: 'Build modern websites from scratch.', type: 'video', category: 'Programming', image_url: 'https://images.pexels.com/photos/270404/pexels-photo-270404.jpeg?auto=compress&cs=tinysrgb&w=600', is_premium: true, rating: 4.9 },
  { name: 'Essay Writing Masterclass', description: 'Improve your academic writing skills.', type: 'tutorial', category: 'Writing', image_url: 'https://images.pexels.com/photos/261909/pexels-photo-261909.jpeg?auto=compress&cs=tinysrgb&w=600', is_premium: false, rating: 4.5 },
  { name: 'Physics Practice Set', description: '100 problems with step-by-step solutions.', type: 'exercise', category: 'Science', image_url: 'https://images.pexels.com/photos/60022/pexels-photo-60022.jpeg?auto=compress&cs=tinysrgb&w=600', is_premium: false, rating: 4.4 },
  { name: 'Machine Learning Notes', description: 'Comprehensive ML theory document.', type: 'document', category: 'Data Science', image_url: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=600', is_premium: true, rating: 4.7 },
  { name: 'English Grammar Handbook', description: 'Complete reference for English grammar rules.', type: 'ebook', category: 'Language', image_url: 'https://images.pexels.com/photos/256541/pexels-photo-256541.jpeg?auto=compress&cs=tinysrgb&w=600', is_premium: false, rating: 4.6 },
];

export interface Testimonial {
  name: string;
  role: string;
  avatar: string;
  text: string;
}

export const TESTIMONIALS: Testimonial[] = [
  { name: 'Sopheap Ly', role: 'Computer Science Student', avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200', text: 'EDU transformed how I study. The AI Programming Assistant helps me debug code faster than ever before.' },
  { name: 'Dara Kim', role: 'High School Student', avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=200', text: 'The Math Solver explains every step clearly. My grades have improved significantly this semester.' },
  { name: 'Chanthou Mey', role: 'University Student', avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200', text: 'I love how all the AI tools and resources are in one place. The Pro plan is absolutely worth it.' },
];

export interface FAQItem {
  question: string;
  answer: string;
}

export const FAQS: FAQItem[] = [
  { question: 'What is EDU?', answer: 'EDU is an all-in-one AI-powered education platform where students can learn, access educational resources, and use powerful AI tools.' },
  { question: 'Is EDU free to use?', answer: 'Yes! The Free plan gives you limited daily AI usage and access to free educational content. Upgrade to Pro for unlimited usage and premium features.' },
  { question: 'What is included in the Pro plan?', answer: 'Pro includes unlimited AI usage, premium tools and courses, faster responses, priority support, cloud history, and advanced features.' },
  { question: 'Can I cancel my subscription anytime?', answer: 'Absolutely. You can cancel your Pro subscription at any time and continue using Free plan features.' },
  { question: 'Do I need to create an account?', answer: 'Guests can browse tools and view resources. To use AI tools and save favorites, create a free account.' },
  { question: 'Which payment methods are supported?', answer: 'We support ABA Pay, KHQR, Visa/MasterCard, PayPal, and Stripe for secure upgrades.' },
];
