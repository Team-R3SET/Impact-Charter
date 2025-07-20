export interface BusinessPlanSection {
  id: string
  title: string
  description: string
  placeholder: string
  order: number
}

export const BUSINESS_PLAN_SECTIONS: BusinessPlanSection[] = [
  {
    id: "executive-summary",
    title: "Executive Summary",
    description: "A brief overview of your business concept, mission, and key success factors.",
    placeholder:
      "Provide a concise overview of your business, including your mission statement, key products or services, target market, and what makes your business unique...",
    order: 1,
  },
  {
    id: "company-description",
    title: "Company Description",
    description: "Detailed information about your company, its history, and structure.",
    placeholder:
      "Describe your company's history, ownership structure, location, and legal structure. Explain what your company does and what makes it unique in the marketplace...",
    order: 2,
  },
  {
    id: "market-analysis",
    title: "Market Analysis",
    description: "Research and analysis of your target market and industry.",
    placeholder:
      "Analyze your industry, target market size, demographics, growth trends, and competitive landscape. Include market research data and customer analysis...",
    order: 3,
  },
  {
    id: "organization-management",
    title: "Organization & Management",
    description: "Your company's organizational structure and management team.",
    placeholder:
      "Describe your organizational structure, key management team members, their roles, experience, and qualifications. Include an organizational chart if applicable...",
    order: 4,
  },
  {
    id: "products-services",
    title: "Products or Services",
    description: "Detailed description of your products or services.",
    placeholder:
      "Provide detailed descriptions of your products or services, their features, benefits, lifecycle, and how they meet customer needs. Include pricing strategy...",
    order: 5,
  },
  {
    id: "marketing-sales",
    title: "Marketing & Sales",
    description: "Your marketing strategy and sales approach.",
    placeholder:
      "Outline your marketing strategy, sales tactics, pricing strategy, advertising plans, and customer acquisition methods. Include your sales forecast...",
    order: 6,
  },
  {
    id: "funding-request",
    title: "Funding Request",
    description: "Details about funding requirements and how funds will be used.",
    placeholder:
      "If seeking funding, specify the amount needed, how funds will be used, and the type of funding requested (debt, equity, etc.). Include repayment terms...",
    order: 7,
  },
  {
    id: "financial-projections",
    title: "Financial Projections",
    description: "Financial forecasts and projections for your business.",
    placeholder:
      "Provide financial projections including income statements, cash flow statements, and balance sheets for the next 3-5 years. Include break-even analysis...",
    order: 8,
  },
  {
    id: "appendix",
    title: "Appendix",
    description: "Supporting documents and additional information.",
    placeholder:
      "Include supporting documents such as resumes, permits, lease agreements, legal documents, and other relevant materials that support your business plan...",
    order: 9,
  },
  {
    id: "implementation-timeline",
    title: "Implementation Timeline",
    description: "Timeline for implementing your business plan.",
    placeholder:
      "Create a detailed timeline showing key milestones, deadlines, and implementation phases for launching and growing your business...",
    order: 10,
  },
]

// Export alias for backward compatibility
export const businessPlanSections = BUSINESS_PLAN_SECTIONS

// Default export
export default BUSINESS_PLAN_SECTIONS

// Helper functions
export function getSectionById(id: string): BusinessPlanSection | undefined {
  return BUSINESS_PLAN_SECTIONS.find((section) => section.id === id)
}

export function getSectionByOrder(order: number): BusinessPlanSection | undefined {
  return BUSINESS_PLAN_SECTIONS.find((section) => section.order === order)
}

export function getNextSection(currentId: string): BusinessPlanSection | undefined {
  const current = getSectionById(currentId)
  if (!current) return undefined
  return getSectionByOrder(current.order + 1)
}

export function getPreviousSection(currentId: string): BusinessPlanSection | undefined {
  const current = getSectionById(currentId)
  if (!current) return undefined
  return getSectionByOrder(current.order - 1)
}
