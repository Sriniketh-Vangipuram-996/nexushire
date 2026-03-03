import OpenAI from "openai";

const openai=new OpenAI({
    apiKey:process.env.OPENAI_API_KEY,
});

export const analyzeMatch=async(
    resumeText:string,
    jobDescription:string,
)=>{
    const prompt=`
        You are an expert texch recruiter/

        Compare this resume and job description.

        Return JSON only in this format:

        {
         "score":number(0-100),
         "strengths":string[],
         "missingSkills":string[],
         "suggestions":string[]
        }

        Resume:
        ${resumeText}

        Job Description:
        ${jobDescription}
    `;

    const response=await openai.chat.completions.create({
        model:"gpt-4o-mini",
        messages:[
            {role:"system",content:"You are a professional recruiter."},
            {role:"user",content:prompt},
        ],
        temperature:0.3,
    });

    const content=response.choices[0].message.content;
    return JSON.parse(content||"{}");
}