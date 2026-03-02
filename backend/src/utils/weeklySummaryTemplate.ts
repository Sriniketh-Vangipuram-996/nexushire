type WeeklySummaryTemplateProps = {
  name: string;
  totalApplications: number;
  interviews: number;
  offers: number;
  pendingFollowUps: number;
};

export const weeklySummaryTemplate = ({
  name,
  totalApplications,
  interviews,
  offers,
  pendingFollowUps,
}: WeeklySummaryTemplateProps): string => {
  return `
    <div style="font-family: Arial; padding: 20px;">
      <h2>Hi ${name},</h2>
      <p>Here’s your weekly career summary:</p>

      <ul>
        <li>Total Applications: <b>${totalApplications}</b></li>
        <li>Interviews: <b>${interviews}</b></li>
        <li>Offers: <b>${offers}</b></li>
        <li>Pending Follow-ups: <b>${pendingFollowUps}</b></li>
      </ul>

      <p>Keep pushing 🚀</p>
      <p>— Team NexusHire</p>
    </div>
  `;
};