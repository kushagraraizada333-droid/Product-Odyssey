export interface QuestionOption {
  key: "A" | "B" | "C" | "D";
  text: string;
}

export interface Question {
  id: number;
  level: 1 | 2;
  title: string;
  category: string;
  question: string;
  options: QuestionOption[];
  correctAnswer: "A" | "B" | "C" | "D";
  explanation: string;
  badgeName: string;
}

export const QUESTIONS: Question[] = [
  // LEVEL 1: THE PRODUCT APPRENTICE
  {
    id: 1,
    level: 1,
    title: "Question 1 — Product Manager Fundamentals",
    category: "PM Fundamentals",
    badgeName: "Problem Solver Badge",
    question: "What is the primary responsibility of a Product Manager?",
    options: [
      { key: "A", text: "Write all the application's code." },
      { key: "B", text: "Understand user problems and align teams to deliver product value." },
      { key: "C", text: "Design every screen personally." },
      { key: "D", text: "Manage only the marketing budget." },
    ],
    correctAnswer: "B",
    explanation: "A Product Manager connects user needs, business goals, and technical feasibility to guide product decisions.",
  },
  {
    id: 2,
    level: 1,
    title: "Question 2 — Customer Discovery",
    category: "Customer Discovery",
    badgeName: "Empathy Compass",
    question: "You want to build a food-delivery feature, but you are unsure whether customers need it. What should you do first?",
    options: [
      { key: "A", text: "Build the complete feature immediately." },
      { key: "B", text: "Research customer needs and validate the problem." },
      { key: "C", text: "Copy a competitor's feature." },
      { key: "D", text: "Launch advertisements before investigating." },
    ],
    correctAnswer: "B",
    explanation: "Validate the customer problem before committing significant development resources.",
  },
  {
    id: 3,
    level: 1,
    title: "Question 3 — MVP",
    category: "MVP & Validation",
    badgeName: "Agile Builder Badge",
    question: "What is the main purpose of a Minimum Viable Product?",
    options: [
      { key: "A", text: "Include every planned feature." },
      { key: "B", text: "Deliver a complete premium experience from day one." },
      { key: "C", text: "Test the core value proposition with the smallest useful product." },
      { key: "D", text: "Avoid collecting customer feedback." },
    ],
    correctAnswer: "C",
    explanation: "An MVP helps test important assumptions and learn from real users with limited initial effort.",
  },
  {
    id: 4,
    level: 1,
    title: "Question 4 — Prioritization",
    category: "Prioritization",
    badgeName: "Value Balancer Badge",
    question: "Your engineering team has time to build only one feature. How should you prioritize?",
    options: [
      { key: "A", text: "Select the feature requested by the loudest stakeholder." },
      { key: "B", text: "Choose the feature with the most attractive design." },
      { key: "C", text: "Evaluate user impact, business value, effort, and strategic alignment." },
      { key: "D", text: "Randomly choose a feature." },
    ],
    correctAnswer: "C",
    explanation: "Prioritization should balance expected value, effort, user needs, and product strategy.",
  },
  {
    id: 5,
    level: 1,
    title: "Question 5 — Product-Market Fit",
    category: "Product-Market Fit",
    badgeName: "PMF Signal Gem",
    question: "What is a useful signal that a product may be achieving product-market fit?",
    options: [
      { key: "A", text: "The team has built many features." },
      { key: "B", text: "Users repeatedly find value in the product and continue using it." },
      { key: "C", text: "The product has an expensive design." },
      { key: "D", text: "The launch presentation received applause." },
    ],
    correctAnswer: "B",
    explanation: "Consistent usage, retention, and strong customer demand can indicate that a product is solving a meaningful problem.",
  },

  // LEVEL 2: THE PRODUCT CHAMPION
  {
    id: 6,
    level: 2,
    title: "Question 6 — North Star Metric",
    category: "Product Metrics",
    badgeName: "North Star Beacon",
    question: "A music-streaming app wants to measure the core value users receive from its service. Which metric could be most useful?",
    options: [
      { key: "A", text: "Number of office employees." },
      { key: "B", text: "Total number of buttons on the homepage." },
      { key: "C", text: "Meaningful listening time per active user." },
      { key: "D", text: "Number of internal meetings." },
    ],
    correctAnswer: "C",
    explanation: "A useful North Star Metric reflects the core value delivered to users and aligns with sustainable product growth.",
  },
  {
    id: 7,
    level: 2,
    title: "Question 7 — Retention",
    category: "User Retention",
    badgeName: "Cohort Analyzer",
    question: "An app gains many new users, but most stop using it after one week. What should the Product Manager investigate first?",
    options: [
      { key: "A", text: "Increase the number of app colors." },
      { key: "B", text: "Understand user behavior, onboarding friction, and reasons for churn." },
      { key: "C", text: "Add unrelated features." },
      { key: "D", text: "Stop measuring retention." },
    ],
    correctAnswer: "B",
    explanation: "Investigating user behavior and churn helps identify why customers are not receiving enough ongoing value.",
  },
  {
    id: 8,
    level: 2,
    title: "Question 8 — RICE Prioritization",
    category: "Frameworks",
    badgeName: "RICE Master Key",
    question: "Which four factors are used in the RICE prioritization framework?",
    options: [
      { key: "A", text: "Revenue, Investment, Cost, Execution." },
      { key: "B", text: "Reach, Impact, Confidence, Effort." },
      { key: "C", text: "Research, Innovation, Customers, Engagement." },
      { key: "D", text: "Retention, Income, Conversion, Expansion." },
    ],
    correctAnswer: "B",
    explanation: "RICE compares features using Reach, Impact, Confidence, and Effort.",
  },
  {
    id: 9,
    level: 2,
    title: "Question 9 — Product Metrics",
    category: "Trade-offs & Guardrails",
    badgeName: "Guardrail Shield",
    question: "A checkout redesign increases conversion but also causes a sharp increase in payment failures. What should the Product Manager do?",
    options: [
      { key: "A", text: "Celebrate conversion and ignore payment failures." },
      { key: "B", text: "Roll out the redesign to everyone immediately." },
      { key: "C", text: "Investigate the trade-off, protect payment reliability, and evaluate the overall impact." },
      { key: "D", text: "Remove all checkout analytics." },
    ],
    correctAnswer: "C",
    explanation: "Product decisions should consider primary metrics and guardrails so that one improvement does not damage the overall experience.",
  },
  {
    id: 10,
    level: 2,
    title: "Question 10 — Product Strategy",
    category: "Competitive Strategy",
    badgeName: "Crown of Strategy",
    question: "Your competitor launches a popular feature. What is the best first response?",
    options: [
      { key: "A", text: "Copy it immediately without investigation." },
      { key: "B", text: "Understand customer needs, strategic fit, and the competitor's value proposition before deciding." },
      { key: "C", text: "Cancel your product roadmap." },
      { key: "D", text: "Lower every price without analysis." },
    ],
    correctAnswer: "B",
    explanation: "Strong product strategy is based on customer value, differentiation, business objectives, and evidence rather than automatic imitation.",
  },
];
