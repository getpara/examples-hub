import { PLAN_PERMISSIONS, PlanSlug } from './constants';

export const getPlanPermissions = (planSlug: string) => PLAN_PERMISSIONS[planSlug.toUpperCase() as PlanSlug];
