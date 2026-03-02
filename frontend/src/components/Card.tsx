import type { ReactNode } from "react";

interface CardProps{
    title:string;
    children:ReactNode;
}


const Card = ({ title, children }: CardProps) => (
  <div className="bg-white shadow rounded-xl p-6">
    <h2 className="text-xl font-semibold mb-4">{title}</h2>
    {children}
  </div>
);

export default Card;