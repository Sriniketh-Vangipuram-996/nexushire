export const remainderTemplate=(jobTitle:string,company:string)=>{
    return `
    <div style="font-family:Arial; padding:20px;">
        <h2>Reminder: Follow up on your application</h2>
        <p>This is a reminder to follow up on your application for :</p>
        <h3>${jobTitle} at ${company}</h3>
        <p>Stay consistent. Follow-ups increase success rate</p>
        <br/>
        <small>--NEXUSHIRE</small>
    </div>
    `
}