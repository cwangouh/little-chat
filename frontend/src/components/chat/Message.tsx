import clsx from 'clsx';
import type { ReactNode } from "react";

interface MessageProps {
    is_my: boolean,
    children?: ReactNode;
}

const Message: React.FC<MessageProps> = ({ is_my, children }) => {
    return <>
        <div className={clsx(
            "w-full mb-3 flex",
            is_my ? "flex-row-reverse" : "flex-row",

        )}>
            <div className={clsx(
                "min-w-40 max-w-sm px-2 py-1 border-1 border-gray-300 rounded-xs grow",
                is_my ? "bg-white" : "bg-amber-100"
            )}>
                {children}
            </div>
        </div>
    </>
}

interface TextMessageProps extends MessageProps {
    text: string;
}

export const TextMessage: React.FC<TextMessageProps> = ({ text, ...rest }) => {
    return <>
        <Message {...rest}>
            <div className="w-full text-left">
                <span>{text}</span>
            </div>
        </Message>
    </>
}