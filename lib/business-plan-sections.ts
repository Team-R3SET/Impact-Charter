export interface BusinessPlanSection {
  id: string
  title: string
  description: string
  placeholder: string
}

export const BUSINESS_PLAN_SECTIONS: BusinessPlanSection[] = [
  {
    id: "executive-summary",
    title: "Executive Summary",
    description: "A brief overview of your business concept, market, and financial highlights.",
    placeholder:
      "Provide a concise overview of your business, including your mission statement, product/service offering, target market, and key financial projections...",
  },
  {
    id: "company-description",
    title: "Company Description",
    description: "Detailed information about your company, its history, and structure.",
    placeholder: "Describe your company's history, ownership structure, location, and the nature of your business...",
  },
  {
    id: "market-analysis",
    title: "Market Analysis",
    description: "Research and analysis of your industry, target market, and competition.",
    placeholder: "Analyze your industry trends, target market demographics, market size, and competitive landscape...",
  },
  {
    id: "organization-management",
    title: "Organization & Management",
    description: "Your company's organizational structure and management team.",
    placeholder: "Outline your organizational structure, key management personnel, and their qualifications...",
  },
  {
    id: "products-services",
    title: "Products/Services",
    description: "Detailed description of your products or services.",
    placeholder:
      "Describe your products or services, their benefits, lifecycle, and any research & development activities...",
  },
  {
    id: "marketing-sales",
    title: "Marketing & Sales Strategy",
    description: "Your strategy for attracting and retaining customers.",
    placeholder: "Explain your marketing strategy, sales process, pricing strategy, and customer acquisition plans...",
  },
  {
    id: "financial-projections",
    title: "Financial Projections",
    description: "Financial forecasts and projections for your business.",
    placeholder: "Include income statements, cash flow projections, balance sheets, and break-even analysis...",
  },
  {
    id: "funding-requirements",
    title: "Funding Requirements",
    description: "Your funding needs and how you plan to use the investment.",
    placeholder: "Specify how much funding you need, how you will use it, and your preferred funding sources...",
  },
  {
    id: "risk-analysis",
    title: "Risk Analysis",
    description: "Potential risks and your mitigation strategies.",
    placeholder: "Identify potential risks to your business and explain how you plan to mitigate them...",
  },
  {
    id: "implementation-timeline",
    title: "Implementation Timeline",
    description: "Timeline for implementing your business plan.",
    placeholder: "Provide a timeline with key milestones and deadlines for implementing your business plan...",
  },
]
