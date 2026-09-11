import FeatureFlag from "../models/FeatureFlag";

export class FeatureFlagService {
  static async isEnabled(key: string): Promise<boolean> {
    const envFlag = process.env[`FEATURE_${key}`];

    // Only use ENV if it's actually defined
    if (envFlag !== undefined) {
      return envFlag === "true";
    }

    const flag = await FeatureFlag.findOne({ key });
    return flag?.enabled ?? false;
  }
}