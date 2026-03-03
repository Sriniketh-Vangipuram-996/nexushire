import FeatureFlag from "../common/models/FeatureFlag";

export class FeatureFlagService{
    static async isEnabled(key:string):Promise<boolean>{
        //ENV override first

        const envFlag=process.env[`FEATURE_${key}`];
        if(envFlag!=="undefined"){
            return envFlag==="true";
        }

        const flag=await FeatureFlag.findOne({key});
        return flag?.enabled??false;
    }
}