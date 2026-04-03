import { cn } from "@/lib/utils";

export default function Input({type, className, placeholder, prependText,labelText,  ...rest}:{type?: string;className?: string;placeholder?: string;prependText?: string | undefined;labelText?: string}){
    return (
        <>

            <label className="mb-2 block text-sm font-medium text-[#333333]">{labelText}</label>
            <div className="relative ">
                {prependText && <span className="font-medium content-center p-1 text-center h-[38px] rounded-l-md left-[1px] top-[1px] absolute bg-[#F5F5F5] w-[38px]">{prependText}</span>}
                <input type={type} {...rest} placeholder={placeholder} className={cn("border border-[#BDBDBD] h-10 rounded-md p-2.5 w-full bg-white outline-none", className, prependText ? "pl-12" : "")} />
            </div>
        </>
    )    
}