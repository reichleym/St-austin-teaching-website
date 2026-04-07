import { cn } from "@/lib/utils";
import { ReactNode } from "react";

type SelectProps = {
  className?: string;
  placeholder?: string;
  labelText?: string;
  children?: ReactNode;
} & React.SelectHTMLAttributes<HTMLSelectElement>;

export default function Select({ className, labelText, children, ...rest }: SelectProps) {
  return (
    <>
      {labelText ? <label className="mb-2 block text-sm font-medium text-[#333333]">{labelText}</label> : null}
      <select {...rest} className={cn("border border-[#BDBDBD] h-10 rounded-md p-2.5 w-full bg-white outline-none", className)}>
        {children}
      </select>
    </>
  );
}
