export type PlanIncludes = {
  title: string;
  subtitle: string;
  includes: string[];
  excludes: string[];
  comingSoon: string[];
};

export type PlanMetadata = {
  name: string;
  slug: string;
  monthlyCost: number;
  allowanceString: string;
  maxAllowance: number;
  mustContact: boolean;
  footnote?: string;
  includes: PlanIncludes;
};
