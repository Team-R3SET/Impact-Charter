export interface BusinessPlanSection {
  id: string
  title: string
  description: string
}

export const businessPlanSections: BusinessPlanSection[] = [
  {
    id: "executive-summary",
    title: "Executive Summary",
    description: "A brief overview of your business concept, market opportunity, and key success factors.",
  },
  {
    id: "company-description",
    title: "Company Description",
    description: "Detailed information about your company, its history, and what makes it unique.",
  },
  {
    id: "market-analysis",
    title: "Market Analysis",
    description: "Research and analysis of your target market, industry trends, and competitive landscape.",
  },
  {
    id: "organization-management",
    title: "Organization & Management",
    description: "Your company's organizational structure and management team profiles.",
  },
  {
    id: "products-services",
    title: "Products or Services",
    description: "Detailed description of your products or services and their unique value proposition.",
  },
  {
    id: "marketing-sales",
    title: "Marketing & Sales",
    description: "Your marketing strategy, sales approach, and customer acquisition plans.",
  },
  {
    id: "funding-request",
    title: "Funding Request",
    description: "If seeking funding, specify the amount needed and how it will be used.",
  },
  {
    id: "financial-projections",
    title: "Financial Projections",
    description: "Financial forecasts including income statements, cash flow, and balance sheets.",
  },
  {
    id: "appendix",
    title: "Appendix",
    description: "Supporting documents, charts, and additional information.",
  },
  {
    id: "risk-analysis",
    title: "Risk Analysis",
    description: "Identification and assessment of potential risks and mitigation strategies.",
  },
]

export function getSectionById(sectionId: string): BusinessPlanSection | undefined {
  return businessPlanSections.find((section) => section.id === sectionId)
}

export function getSectionIndex(sectionId: string): number {
  return businessPlanSections.findIndex((section) => section.id === sectionId)
}

export function getNextSection(currentSectionId: string): BusinessPlanSection | null {
  const currentIndex = getSectionIndex(currentSectionId)
  if (currentIndex === -1 || currentIndex === businessPlanSections.length - 1) {
    return null
  }
  return businessPlanSections[currentIndex + 1]
}

export function getPreviousSection(currentSectionId: string): BusinessPlanSection | null {
  const currentIndex = getSectionIndex(currentSectionId)
  if (currentIndex <= 0) {
    return null
  }
  return businessPlanSections[currentIndex - 1]
}

export function getAllSectionIds(): string[] {
  return businessPlanSections.map((section) => section.id)
}

export function getSectionTitle(sectionId: string): string {
  const section = getSectionById(sectionId)
  return section?.title || "Unknown Section"
}

// ------------------------------------------------------------------
// Temporary helper until the template/seed feature is redesigned.
// It simply aliases the default array so nothing breaks at build time.
export const businessPlanSectionsTemplate = businessPlanSections
