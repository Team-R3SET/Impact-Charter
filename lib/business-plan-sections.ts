export interface BusinessPlanSection {
  id: string
  title: string
  description: string
}

export const businessPlanSections: BusinessPlanSection[] = [
  {
    id: "executive-summary",
    title: "Executive Summary",
    description: "A brief overview of your business concept, market, and financial projections.",
  },
  {
    id: "company-description",
    title: "Company Description",
    description: "Detailed information about your company, its history, and what it does.",
  },
  {
    id: "market-analysis",
    title: "Market Analysis",
    description: "Research and analysis of your industry, market size, and target customers.",
  },
  {
    id: "organization-management",
    title: "Organization & Management",
    description: "Your company's organizational structure and management team.",
  },
  {
    id: "products-services",
    title: "Products or Services",
    description: "Detailed description of your products or services.",
  },
  {
    id: "marketing-sales",
    title: "Marketing & Sales",
    description: "Your marketing strategy and sales approach.",
  },
  {
    id: "funding-request",
    title: "Funding Request",
    description: "If you're seeking funding, outline your funding requirements.",
  },
  {
    id: "financial-projections",
    title: "Financial Projections",
    description: "Financial forecasts including income statements, cash flow, and balance sheets.",
  },
  {
    id: "appendix",
    title: "Appendix",
    description: "Supporting documents and additional information.",
  },
]

export function getNextSection(currentSectionId: string): BusinessPlanSection | null {
  const currentIndex = businessPlanSections.findIndex((section) => section.id === currentSectionId)
  if (currentIndex === -1 || currentIndex === businessPlanSections.length - 1) {
    return null
  }
  return businessPlanSections[currentIndex + 1]
}

export function getPreviousSection(currentSectionId: string): BusinessPlanSection | null {
  const currentIndex = businessPlanSections.findIndex((section) => section.id === currentSectionId)
  if (currentIndex <= 0) {
    return null
  }
  return businessPlanSections[currentIndex - 1]
}

export function getSectionByIndex(index: number): BusinessPlanSection | null {
  if (index < 0 || index >= businessPlanSections.length) {
    return null
  }
  return businessPlanSections[index]
}

export function getSectionIndex(sectionId: string): number {
  return businessPlanSections.findIndex((section) => section.id === sectionId)
}
