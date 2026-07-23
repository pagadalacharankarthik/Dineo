export const PLAN_LIMITS = {
  FREE_TRIAL: {
    maxCategories: 5,
    maxMenuItems: 25,
    maxCoupons: 1,
    canDownloadSvg: false,
  },
  EARLY_ADOPTER: {
    maxCategories: 10,
    maxMenuItems: 50,
    maxCoupons: Infinity,
    canDownloadSvg: true,
  },
  PRO: {
    maxCategories: Infinity,
    maxMenuItems: Infinity,
    maxCoupons: Infinity,
    canDownloadSvg: true,
  },
  ENTERPRISE: {
    maxCategories: Infinity,
    maxMenuItems: Infinity,
    maxCoupons: Infinity,
    canDownloadSvg: true,
  }
};

export function getLimitsForPlan(planName: string) {
  // @ts-ignore
  return PLAN_LIMITS[planName] || PLAN_LIMITS.FREE_TRIAL;
}
