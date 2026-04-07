import { cn } from "@/lib/utils";

export default function Input({type, className, placeholder, prependText,labelText,  ...rest}:{type?: string;className?: string;placeholder?: string;prependText?: string | undefined;labelText?: string}){
    return (
        <>
            {labelText ? <label className="mb-2 block text-sm font-medium text-[#333333]">{labelText}</label> : null}
            <div className="relative w-full">
                {prependText ? (
                    <span className="absolute left-[1px] top-[1px] flex h-[38px] w-[38px] items-center justify-center rounded-l-md">
                        {prependText === "📞" ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                                <path d="M6.52439 13.4756C4.73223 11.68 3.35399 9.51448 2.48606 7.13061C2.00856 5.82728 2.44606 4.39561 3.42772 3.41394L4.03522 2.80727C4.19855 2.64362 4.39254 2.51379 4.6061 2.4252C4.81966 2.33661 5.0486 2.29102 5.27981 2.29102C5.51101 2.29102 5.73995 2.33661 5.95351 2.4252C6.16707 2.51379 6.36107 2.64362 6.52439 2.80727L7.94689 4.22978C8.11054 4.3931 8.24038 4.58709 8.32896 4.80065C8.41755 5.01422 8.46315 5.24315 8.46315 5.47436C8.46315 5.70556 8.41755 5.9345 8.32896 6.14806C8.24038 6.36162 8.11054 6.55562 7.94689 6.71894L7.59689 7.06894C7.45679 7.20901 7.34566 7.3753 7.26984 7.55832C7.19402 7.74134 7.15499 7.9375 7.15499 8.13561C7.15499 8.33371 7.19402 8.52988 7.26984 8.7129C7.34566 8.89592 7.45679 9.06221 7.59689 9.20228L10.7969 12.4031C10.937 12.5432 11.1032 12.6543 11.2863 12.7302C11.4693 12.806 11.6655 12.845 11.8636 12.845C12.0617 12.845 12.2578 12.806 12.4408 12.7302C12.6239 12.6543 12.7902 12.5432 12.9302 12.4031L13.2811 12.0531C13.4444 11.8895 13.6384 11.7596 13.8519 11.671C14.0655 11.5824 14.2944 11.5368 14.5256 11.5368C14.7568 11.5368 14.9858 11.5824 15.1993 11.671C15.4129 11.7596 15.6069 11.8895 15.7702 12.0531L17.1927 13.4756C17.3564 13.6389 17.4862 13.8329 17.5748 14.0465C17.6634 14.26 17.709 14.489 17.709 14.7202C17.709 14.9514 17.6634 15.1803 17.5748 15.3939C17.4862 15.6075 17.3564 15.8015 17.1927 15.9648L16.5861 16.5714C15.6044 17.5539 14.1727 17.9914 12.8694 17.5139C10.4855 16.646 8.32003 15.2678 6.52439 13.4756Z" stroke="#333333" strokeOpacity="0.5" strokeWidth="1.2" strokeLinejoin="round"/>
                            </svg>
                        ) : (
                            prependText
                        )}
                    </span>
                ) : null}
                <input
                    type={type}
                    {...rest}
                    placeholder={placeholder}
                    className={cn(
                        "border border-[#BDBDBD] h-10 rounded-md p-2.5 w-full bg-white outline-none placeholder:text-[18px] placeholder:font-normal placeholder:text-[#33333380]",
                        className,
                        prependText ? "pl-12" : ""
                    )}
                />
            </div>
        </>
    )    
}
