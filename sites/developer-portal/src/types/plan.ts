export type PlanIncludes = {
  title: string;
  subtitle: string;
  includes: string[];
  comingSoon: string[];
};

export type Plan = {
  name: string;
  slug: string;
  monthlyCost: number;
  allowanceString: string;
  maxAllowance: number;
  mustContact: boolean;
  footnote?: string;
  includes: PlanIncludes;
};
